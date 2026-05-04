import yfinance as yf
from datetime import datetime
import json
import os

# Constants
OUTPUT_FILE = 'public/data/market_snapshot.json'

INDICES_MAP = {
    'NIFTY 50':   '^NSEI',
    'NIFTY BANK': '^NSEBANK',
    'NIFTY IT':   '^CNXIT',
}

# Top NSE heavyweights for movers scan
STOCKS = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'SBIN.NS', 'ITC.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS',
    'HINDUNILVR.NS', 'AXISBANK.NS', 'BAJFINANCE.NS', 'MARUTI.NS', 'WIPRO.NS',
]


def get_quote(ticker_symbol):
    """Return (price, change, change_pct) for a Yahoo Finance symbol."""
    tk = yf.Ticker(ticker_symbol)
    hist = tk.history(period='2d', interval='1d')
    if hist.empty or len(hist) < 1:
        return None
    close = hist['Close'].iloc[-1]
    prev  = hist['Close'].iloc[-2] if len(hist) >= 2 else close
    change     = close - prev
    change_pct = (change / prev * 100) if prev else 0.0
    return float(close), float(change), float(change_pct)


def fetch_market_snapshot():
    print("[MarketSnapshot] Starting fetch using yfinance...")

    snapshot = {
        "indices": [],
        "movers":  {"gainers": [], "losers": []},
        "generatedAt": datetime.utcnow().isoformat() + 'Z',
    }

    # 1. Fetch Indices
    for display_name, yf_symbol in INDICES_MAP.items():
        print(f"Fetching index {display_name} ({yf_symbol})...")
        try:
            result = get_quote(yf_symbol)
            if result is None:
                print(f"  No data for {display_name}")
                continue
            price, change, change_pct = result
            snapshot["indices"].append({
                "name":          display_name,
                "value":         f"{price:.2f}",
                "change":        f"{change:.2f}",
                "changePercent": f"{change_pct:.2f}",
                "direction":     "up" if change >= 0 else "down",
            })
            print(f"  {display_name}: {price:.2f} ({change_pct:+.2f}%)")
        except Exception as e:
            print(f"  Error fetching {display_name}: {e}")

    # 2. Fetch stock movers (top NSE heavyweights)
    stock_data = []
    for symbol in STOCKS:
        print(f"Fetching stock {symbol}...")
        try:
            result = get_quote(symbol)
            if result is None:
                continue
            price, change, change_pct = result
            display_symbol = symbol.replace('.NS', '').replace('.BO', '')
            stock_data.append({
                "symbol":        display_symbol,
                "price":         f"{price:.2f}",
                "change":        f"{change:.2f}",
                "changePercent": change_pct,
                "direction":     "up" if change >= 0 else "down",
            })
        except Exception as e:
            print(f"  Error fetching {symbol}: {e}")

    if stock_data:
        stock_data.sort(key=lambda x: float(x['changePercent']), reverse=True)
        gainers = [s for s in stock_data if float(s['changePercent']) > 0]
        losers  = [s for s in stock_data if float(s['changePercent']) < 0]
        losers.sort(key=lambda x: float(x['changePercent']))

        snapshot["movers"]["gainers"] = gainers[:5]
        snapshot["movers"]["losers"]  = losers[:5]

        for s in snapshot["movers"]["gainers"] + snapshot["movers"]["losers"]:
            s["changePercent"] = f"{s['changePercent']:.2f}"

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(snapshot, f, indent=2)

    print(f"[MarketSnapshot] Saved to {OUTPUT_FILE}")
    print(f"  Indices: {len(snapshot['indices'])}, "
          f"Gainers: {len(snapshot['movers']['gainers'])}, "
          f"Losers: {len(snapshot['movers']['losers'])}")


if __name__ == "__main__":
    fetch_market_snapshot()
