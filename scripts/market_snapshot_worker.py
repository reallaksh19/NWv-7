from __future__ import annotations

import csv
import io
import json
import os
import re
import tempfile
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional, Tuple

import requests
import yfinance as yf

OUTPUT_MARKET = "public/data/market_snapshot.json"
OUTPUT_METRICS = "public/data/market_metrics.json"
OUTPUT_HEALTH = "public/data/source_health.json"
OUTPUT_MF = "public/data/mutual_fund_snapshot.json"
OUTPUT_FX = "public/data/fx_snapshot.json"

SCHEMA_VERSION = "2.0.0"
REQUEST_TIMEOUT = 14
MAX_WORKERS = 8
MIN_REQUIRED_INDICES = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0 NWv7MarketBot/2.0 (+https://github.com/reallaksh19/NWv-7)",
    "Accept": "text/html,application/xhtml+xml,application/xml,text/plain,*/*",
}

AMFI_NAVALL_URL = "https://www.amfiindia.com/spages/NAVAll.txt"

INDICES_MAP = {
    "NIFTY 50": "^NSEI",
    "SENSEX": "^BSESN",
    "NIFTY BANK": "^NSEBANK",
    "NIFTY IT": "^CNXIT",
    "NIFTY AUTO": "^CNXAUTO",
    "NIFTY PHARMA": "^CNXPHARMA",
}

GLOBAL_INDICES_MAP = {
    "S&P 500": "^GSPC",
    "NASDAQ": "^IXIC",
    "DOW JONES": "^DJI",
    "NIKKEI 225": "^N225",
    "HANG SENG": "^HSI",
}

COMMODITIES_MAP = {
    "Gold": ("GC=F", "$/oz"),
    "Silver": ("SI=F", "$/oz"),
    "Crude Oil": ("CL=F", "$/bbl"),
}

FX_MAP = {
    "USD/INR": "USDINR=X",
    "EUR/INR": "EURINR=X",
    "GBP/INR": "GBPINR=X",
    "JPY/INR": "JPYINR=X",
    "OMR/INR": "OMRINR=X",
}

STOCKS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "SBIN.NS", "ITC.NS", "BHARTIARTL.NS", "KOTAKBANK.NS", "LT.NS",
    "HINDUNILVR.NS", "AXISBANK.NS", "BAJFINANCE.NS", "MARUTI.NS", "WIPRO.NS",
    "SUNPHARMA.NS",
]


@dataclass
class ProviderResult:
    provider: str
    section: str
    status: str
    latency_ms: Optional[int] = None
    message: str = ""
    count: int = 0
    winner: bool = False


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return utc_now().isoformat().replace("+00:00", "Z")


def atomic_write_json(path: str, payload: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(prefix=".snapshot.", suffix=".json", dir=os.path.dirname(path))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(tmp_path, path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def read_json_if_exists(path: str) -> Optional[dict]:
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def http_get(url: str, timeout: int = REQUEST_TIMEOUT) -> requests.Response:
    response = requests.get(url, headers=HEADERS, timeout=timeout)
    response.raise_for_status()
    return response


def safe_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        text = str(value).replace(",", "").replace("₹", "").replace("$", "").replace("%", "").strip()
        if text in {"", "-", "None", "nan"}:
            return None
        parsed = float(text)
        if parsed != parsed:
            return None
        return parsed
    except Exception:
        return None


def format_num(value: Optional[float], digits: int = 2) -> str:
    if value is None:
        return "--"
    return f"{value:,.{digits}f}"


def direction_from_change(change: Optional[float]) -> str:
    if change is None:
        return "neutral"
    return "up" if change >= 0 else "down"


def get_yfinance_quote(symbol: str) -> Optional[Tuple[float, float, float]]:
    try:
        tk = yf.Ticker(symbol)
        hist = tk.history(period="5d", interval="1d", auto_adjust=False)
        if hist.empty or len(hist) < 1:
            return None
        close = float(hist["Close"].iloc[-1])
        prev = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else close
        change = close - prev
        change_pct = (change / prev * 100.0) if prev else 0.0
        return close, change, change_pct
    except Exception:
        return None


def fetch_yahoo_named_quotes(mapping: Dict[str, str], section: str, currency_for_india: bool = False) -> Tuple[List[dict], List[ProviderResult]]:
    rows: List[dict] = []

    def one(item: Tuple[str, str]) -> Optional[dict]:
        name, symbol = item
        quote = get_yfinance_quote(symbol)
        if not quote:
            return None
        price, change, change_pct = quote
        return {
            "name": name,
            "symbol": symbol,
            "value": format_num(price),
            "change": f"{change:.2f}",
            "changePercent": f"{change_pct:.2f}",
            "direction": direction_from_change(change),
            "currency": "₹" if currency_for_india and ("NIFTY" in name or name == "SENSEX") else "",
            "sourceMode": "yahoo-yfinance",
        }

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(one, item) for item in mapping.items()]
        for fut in as_completed(futures):
            item = fut.result()
            if item:
                rows.append(item)

    order = list(mapping.keys())
    rows.sort(key=lambda x: order.index(x["name"]) if x["name"] in order else 999)
    return rows, [ProviderResult("yahoo_yfinance", section, "ok" if rows else "failed", count=len(rows), message=f"{len(rows)} rows fetched", winner=bool(rows))]


def fetch_yahoo_indices() -> Tuple[List[dict], List[ProviderResult]]:
    return fetch_yahoo_named_quotes(INDICES_MAP, "indices", currency_for_india=True)


def fetch_yahoo_global_indices() -> Tuple[List[dict], List[ProviderResult]]:
    return fetch_yahoo_named_quotes(GLOBAL_INDICES_MAP, "globalIndices")


def fetch_yahoo_movers() -> Tuple[dict, List[ProviderResult]]:
    stock_data: List[dict] = []

    def one(symbol: str) -> Optional[dict]:
        quote = get_yfinance_quote(symbol)
        if not quote:
            return None
        price, change, change_pct = quote
        return {
            "symbol": symbol.replace(".NS", "").replace(".BO", ""),
            "price": f"{price:.2f}",
            "change": f"{change:.2f}",
            "changePercent": f"{change_pct:.2f}",
            "direction": direction_from_change(change),
            "sourceMode": "yahoo-yfinance",
        }

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(one, symbol) for symbol in STOCKS]
        for fut in as_completed(futures):
            item = fut.result()
            if item:
                stock_data.append(item)

    gainers = [s for s in stock_data if (safe_float(s["changePercent"]) or 0) > 0]
    losers = [s for s in stock_data if (safe_float(s["changePercent"]) or 0) < 0]
    gainers.sort(key=lambda x: safe_float(x["changePercent"]) or 0, reverse=True)
    losers.sort(key=lambda x: safe_float(x["changePercent"]) or 0)

    movers = {"gainers": gainers[:5], "losers": losers[:5], "source": "yahoo-yfinance"}
    return movers, [ProviderResult("yahoo_yfinance", "movers", "ok" if stock_data else "failed", count=len(stock_data), message=f"{len(stock_data)} stocks scanned", winner=bool(stock_data))]


def fetch_yahoo_commodities() -> Tuple[List[dict], List[ProviderResult]]:
    rows: List[dict] = []

    def one(item: Tuple[str, Tuple[str, str]]) -> Optional[dict]:
        name, (symbol, unit) = item
        quote = get_yfinance_quote(symbol)
        if not quote:
            return None
        price, change, change_pct = quote
        prefix = "$" if unit.startswith("$") else ""
        return {
            "name": name,
            "symbol": symbol,
            "value": f"{prefix}{price:.2f}",
            "unit": unit,
            "change": f"{change:.2f}",
            "changePercent": f"{change_pct:.2f}",
            "direction": direction_from_change(change),
            "source": "yahoo-yfinance",
        }

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(one, item) for item in COMMODITIES_MAP.items()]
        for fut in as_completed(futures):
            item = fut.result()
            if item:
                rows.append(item)
    return rows, [ProviderResult("yahoo_yfinance", "commodities", "ok" if rows else "failed", count=len(rows), message=f"{len(rows)} commodity rows", winner=bool(rows))]


def fetch_yahoo_fx() -> Tuple[List[dict], List[ProviderResult]]:
    rows: List[dict] = []

    def one(item: Tuple[str, str]) -> Optional[dict]:
        pair, symbol = item
        quote = get_yfinance_quote(symbol)
        if not quote:
            return None
        rate, change, change_pct = quote
        return {
            "name": pair,
            "pair": pair.replace("/", ""),
            "symbol": symbol,
            "value": f"₹{rate:.4f}",
            "rate": rate,
            "change": f"{change:.4f}",
            "changePercent": f"{change_pct:.2f}",
            "direction": direction_from_change(change),
            "source": "yahoo-yfinance",
            "mode": "fallback-intraday",
            "asOf": iso_now(),
        }

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(one, item) for item in FX_MAP.items()]
        for fut in as_completed(futures):
            item = fut.result()
            if item:
                rows.append(item)
    return rows, [ProviderResult("yahoo_yfinance", "fx", "ok" if rows else "failed", count=len(rows), message=f"{len(rows)} FX pairs from Yahoo fallback", winner=bool(rows))]


def fetch_rbi_fx_reference() -> Tuple[List[dict], List[ProviderResult]]:
    candidates = [
        "https://www.rbi.org.in/Scripts/ReferenceRateArchive.aspx",
        "https://www.rbi.org.in/scripts/ReferenceRateArchive.aspx",
    ]
    pairs = ["USD", "EUR", "GBP", "JPY"]
    last_error = "unknown"
    for url in candidates:
        try:
            text = re.sub(r"\s+", " ", http_get(url).text)
            rows = []
            for ccy in pairs:
                rate = None
                for pat in [rf"{ccy}\s*[/=]?\s*INR[^0-9]{{0,30}}([0-9]+\.[0-9]+)", rf"1\s*{ccy}[^0-9]{{0,40}}([0-9]+\.[0-9]+)", rf"{ccy}[^0-9]{{0,60}}([0-9]+\.[0-9]+)"]:
                    m = re.search(pat, text, re.IGNORECASE)
                    if m:
                        rate = safe_float(m.group(1))
                        break
                if rate:
                    rows.append({"name": f"{ccy}/INR", "pair": f"{ccy}INR", "value": f"₹{rate:.4f}", "rate": rate, "change": None, "changePercent": None, "direction": "neutral", "source": "rbi-reference", "mode": "official-daily", "asOf": iso_now()})
            if rows:
                return rows, [ProviderResult("rbi_reference", "fx", "ok", count=len(rows), message=f"{len(rows)} RBI/FBIL reference rates parsed", winner=True)]
        except Exception as exc:
            last_error = str(exc)
    return [], [ProviderResult("rbi_reference", "fx", "failed", count=0, message=f"RBI reference scrape failed: {last_error}", winner=False)]


def fetch_amfi_navall() -> Tuple[dict, List[ProviderResult]]:
    try:
        raw = http_get(AMFI_NAVALL_URL).text
        rows: List[dict] = []
        current_category = ""
        reader = csv.reader(io.StringIO(raw), delimiter=";")
        for parts in reader:
            if not parts:
                continue
            if len(parts) == 1:
                value = parts[0].strip()
                if value and not value.lower().startswith("scheme code"):
                    current_category = value
                continue
            if parts[0].strip().lower() == "scheme code" or len(parts) < 6:
                continue
            scheme_code, isin_growth, isin_div, scheme_name, nav_text, nav_date = [p.strip() for p in parts[:6]]
            nav = safe_float(nav_text)
            if not scheme_code or nav is None or not nav_date:
                continue
            rows.append({
                "instrumentType": "mutualFund",
                "schemeCode": scheme_code,
                "isinGrowth": isin_growth or None,
                "isinDividendReinvestment": isin_div or None,
                "name": scheme_name,
                "category": current_category,
                "nav": nav,
                "navDate": nav_date,
                "source": {"provider": "amfi_navall", "mode": "official-daily", "fetchedAt": iso_now()},
                "extras": {},
            })
        focus_keywords = ["direct plan-growth", "nifty 50", "sensex", "liquid", "flexi cap", "large cap", "index fund"]
        selected = [row for row in rows if any(key in row["name"].lower() for key in focus_keywords)][:300]
        payload = {"schemaVersion": SCHEMA_VERSION, "generatedAt": iso_now(), "source": "amfi_navall", "totalRows": len(rows), "mutualFunds": selected}
        return payload, [ProviderResult("amfi_navall", "mutualFunds", "ok" if rows else "empty", count=len(rows), message=f"{len(rows)} AMFI rows parsed; {len(selected)} selected", winner=bool(rows))]
    except Exception as exc:
        return {"schemaVersion": SCHEMA_VERSION, "generatedAt": iso_now(), "source": "amfi_navall", "totalRows": 0, "mutualFunds": []}, [ProviderResult("amfi_navall", "mutualFunds", "failed", count=0, message=str(exc), winner=False)]


def recent_business_dates(days: int = 7) -> Iterable[datetime]:
    current = utc_now().date()
    emitted = 0
    while emitted < days:
        if current.weekday() < 5:
            emitted += 1
            yield datetime(current.year, current.month, current.day, tzinfo=timezone.utc)
        current -= timedelta(days=1)


def nse_bhavcopy_urls(dt: datetime) -> List[str]:
    y = dt.strftime("%Y")
    mmm = dt.strftime("%b").upper()
    dd = dt.strftime("%d")
    ymd = dt.strftime("%Y%m%d")
    return [
        f"https://nsearchives.nseindia.com/content/cm/BhavCopy_NSE_CM_0_0_0_{ymd}_F_0000.csv.zip",
        f"https://archives.nseindia.com/content/historical/EQUITIES/{y}/{mmm}/cm{dd}{mmm}{y}bhav.csv.zip",
    ]


def bse_bhavcopy_urls(dt: datetime) -> List[str]:
    ddmmyy = dt.strftime("%d%m%y")
    ymd = dt.strftime("%Y%m%d")
    return [
        f"https://www.bseindia.com/download/BhavCopy/Equity/EQ_ISINCODE_{ddmmyy}.zip",
        f"https://www.bseindia.com/download/BhavCopy/Equity/BhavCopy_BSE_CM_0_0_0_{ymd}_F_0000.CSV.zip",
    ]


def parse_zip_csv_bytes(content: bytes) -> List[dict]:
    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        names = [name for name in zf.namelist() if name.lower().endswith((".csv", ".txt"))]
        if not names:
            return []
        with zf.open(names[0]) as f:
            text = f.read().decode("utf-8", errors="replace")
    return list(csv.DictReader(io.StringIO(text)))


def fetch_first_bhavcopy(provider: str, url_builder) -> Tuple[List[dict], ProviderResult]:
    for dt in recent_business_dates(days=7):
        for url in url_builder(dt):
            try:
                rows = parse_zip_csv_bytes(http_get(url).content)
                if rows:
                    return rows, ProviderResult(provider, "eodBhavcopy", "ok", count=len(rows), message=f"{provider} bhavcopy parsed from {url}", winner=True)
            except Exception:
                continue
    return [], ProviderResult(provider, "eodBhavcopy", "failed", count=0, message=f"{provider} bhavcopy unavailable from known candidate URLs", winner=False)


def fetch_eod_bhavcopies() -> Tuple[dict, List[ProviderResult]]:
    nse_rows, nse_health = fetch_first_bhavcopy("nse_bhavcopy", nse_bhavcopy_urls)
    bse_rows, bse_health = fetch_first_bhavcopy("bse_bhavcopy", bse_bhavcopy_urls)
    return {"schemaVersion": SCHEMA_VERSION, "generatedAt": iso_now(), "nseRows": len(nse_rows), "bseRows": len(bse_rows), "sampleNse": nse_rows[:25], "sampleBse": bse_rows[:25]}, [nse_health, bse_health]


def provider_results_to_health(results: List[ProviderResult]) -> dict:
    sections: Dict[str, dict] = {}
    for res in results:
        section = sections.setdefault(res.section, {"status": "failed", "freshnessMs": 0, "winner": None, "providersTried": [], "notes": []})
        section["providersTried"].append({"provider": res.provider, "status": res.status, "latencyMs": res.latency_ms, "count": res.count, "message": res.message})
        if res.winner and section["winner"] is None:
            section["winner"] = res.provider
            section["status"] = res.status
    for section in sections.values():
        if section["winner"] is None:
            section["winner"] = "none"
        if any(p["status"] == "ok" for p in section["providersTried"]):
            section["status"] = "ok"
    return {"schemaVersion": "1.0.0", "generatedAt": iso_now(), "sections": sections}


def compat_source_health(source_health: dict) -> dict:
    output: Dict[str, Any] = {}
    for section, info in (source_health.get("sections") or {}).items():
        status = info.get("status") or "unknown"
        winner = info.get("winner") or "unknown"
        output[section] = {"status": status, "provider": winner, "mode": status, "message": "; ".join(p.get("message", "") for p in info.get("providersTried", []) if p.get("message"))[:500]}
    return output


def validate_market_snapshot(snapshot: dict, previous: Optional[dict] = None) -> None:
    indices = snapshot.get("indices") or []
    if len(indices) < MIN_REQUIRED_INDICES:
        raise ValueError(f"Expected at least {MIN_REQUIRED_INDICES} indices, got {len(indices)}")
    names = " ".join(str(i.get("name", "")).upper() for i in indices)
    if "NIFTY" not in names:
        raise ValueError("NIFTY index missing")
    if "SENSEX" not in names and "BANK" not in names:
        raise ValueError("SENSEX or BANK NIFTY missing")
    if previous:
        previous_sections = sum(1 for key in ["globalIndices", "commodities", "currencies", "mutualFunds", "sectorals"] if previous.get(key))
        new_sections = sum(1 for key in ["globalIndices", "commodities", "currencies", "mutualFunds", "sectorals"] if snapshot.get(key))
        if previous_sections >= 3 and new_sections < 2:
            raise ValueError(f"Snapshot section regression: previous had {previous_sections} rich sections, new has {new_sections}")


def merge_with_previous_on_partial(snapshot: dict, previous: Optional[dict]) -> dict:
    if not previous:
        return snapshot
    merged = dict(snapshot)
    for key in ["globalIndices", "commodities", "currencies", "mutualFunds", "sectorals", "fiidii", "ipo", "nfo", "stockCategories"]:
        if not merged.get(key) and previous.get(key):
            merged[key] = previous[key]
            merged.setdefault("sourceHealth", {})
            merged["sourceHealth"][key] = {"status": "stale", "provider": "previous-snapshot", "mode": "stale", "message": f"{key} carried forward from previous snapshot because new worker run had no data."}
    return merged


def build_market_metrics(indices, global_indices, movers, commodities, currencies, mutual_funds, eod, source_health) -> dict:
    return {"schemaVersion": SCHEMA_VERSION, "generatedAt": iso_now(), "asOf": {"equities": iso_now(), "mutualFunds": mutual_funds[0]["navDate"] if mutual_funds else None, "fx": iso_now()}, "equities": {"indices": indices, "globalIndices": global_indices, "movers": movers, "eodBhavcopy": eod}, "mutualFunds": mutual_funds, "fx": currencies, "commodities": commodities, "sourceHealth": source_health}


def run_worker() -> None:
    previous_snapshot = read_json_if_exists(OUTPUT_MARKET)
    provider_health: List[ProviderResult] = []

    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {
            "indices": pool.submit(fetch_yahoo_indices),
            "globalIndices": pool.submit(fetch_yahoo_global_indices),
            "movers": pool.submit(fetch_yahoo_movers),
            "commodities": pool.submit(fetch_yahoo_commodities),
            "yahooFx": pool.submit(fetch_yahoo_fx),
            "rbiFx": pool.submit(fetch_rbi_fx_reference),
            "amfi": pool.submit(fetch_amfi_navall),
            "eod": pool.submit(fetch_eod_bhavcopies),
        }
        indices, h = futures["indices"].result(); provider_health.extend(h)
        global_indices, h = futures["globalIndices"].result(); provider_health.extend(h)
        movers, h = futures["movers"].result(); provider_health.extend(h)
        commodities, h = futures["commodities"].result(); provider_health.extend(h)
        rbi_fx, h = futures["rbiFx"].result(); provider_health.extend(h)
        yahoo_fx, h = futures["yahooFx"].result(); provider_health.extend(h)
        currencies = rbi_fx if rbi_fx else yahoo_fx
        mf_payload, h = futures["amfi"].result(); provider_health.extend(h)
        mutual_funds = mf_payload.get("mutualFunds") or []
        eod_payload, h = futures["eod"].result(); provider_health.extend(h)

    sectorals = [item for item in indices if item.get("name") in {"NIFTY BANK", "NIFTY IT", "NIFTY AUTO", "NIFTY PHARMA"}]
    source_health = provider_results_to_health(provider_health)
    now_iso = iso_now()
    now_ms = int(utc_now().timestamp() * 1000)

    snapshot = {
        "schemaVersion": SCHEMA_VERSION,
        "generatedAt": now_iso,
        "generated_at": now_iso,
        "fetchedAt": now_ms,
        "sourceMode": "snapshot-worker-v2",
        "indices": indices,
        "globalIndices": global_indices,
        "movers": movers,
        "sectorals": sectorals,
        "commodities": commodities,
        "currencies": currencies,
        "mutualFunds": mutual_funds[:50],
        "ipo": previous_snapshot.get("ipo", {"upcoming": [], "live": [], "recent": []}) if previous_snapshot else {"upcoming": [], "live": [], "recent": []},
        "nfo": previous_snapshot.get("nfo", []) if previous_snapshot else [],
        "stockCategories": previous_snapshot.get("stockCategories", {"highs": [], "lows": [], "all": []}) if previous_snapshot else {"highs": [], "lows": [], "all": []},
        "fiidii": previous_snapshot.get("fiidii", {"fii": {}, "dii": {}, "date": ""}) if previous_snapshot else {"fii": {}, "dii": {}, "date": ""},
        "sourceHealth": compat_source_health(source_health),
        "errors": {},
    }
    snapshot = merge_with_previous_on_partial(snapshot, previous_snapshot)

    try:
        validate_market_snapshot(snapshot, previous_snapshot)
    except ValueError as exc:
        if previous_snapshot and (previous_snapshot.get("indices") or []):
            previous_snapshot.setdefault("sourceHealth", {})
            previous_snapshot["sourceHealth"]["worker"] = {"status": "stale", "provider": "market_snapshot_worker_v2", "mode": "preserved-last-good", "message": f"New snapshot rejected: {exc}"}
            atomic_write_json(OUTPUT_MARKET, previous_snapshot)
            print(f"[MarketWorker] New snapshot rejected; preserved last good snapshot: {exc}")
            return
        raise SystemExit(str(exc))

    metrics = build_market_metrics(indices, global_indices, movers, commodities, currencies, mutual_funds, eod_payload, source_health)
    fx_payload = {"schemaVersion": SCHEMA_VERSION, "generatedAt": iso_now(), "currencies": currencies, "sourceHealth": source_health.get("sections", {}).get("fx", {})}

    atomic_write_json(OUTPUT_MARKET, snapshot)
    atomic_write_json(OUTPUT_METRICS, metrics)
    atomic_write_json(OUTPUT_HEALTH, source_health)
    atomic_write_json(OUTPUT_MF, mf_payload)
    atomic_write_json(OUTPUT_FX, fx_payload)

    print("[MarketWorker] Saved snapshots")
    print(json.dumps({"indices": len(indices), "globalIndices": len(global_indices), "gainers": len((movers or {}).get("gainers") or []), "losers": len((movers or {}).get("losers") or []), "sectorals": len(sectorals), "commodities": len(commodities), "currencies": len(currencies), "mutualFunds": len(mutual_funds), "amfiTotalRows": mf_payload.get("totalRows", 0), "nseEodRows": eod_payload.get("nseRows", 0), "bseEodRows": eod_payload.get("bseRows", 0)}, indent=2))


if __name__ == "__main__":
    run_worker()
