import { notify } from '../diagnostics/notification-center.js';

const FLAG = '__xmlCiiDefaultMasterAutoload_v2';
const INPUT_SELECTOR = '[data-option-key="supportConfigJson"]';
const STATUS_ID = 'xml-cii-master-autoload-status';
const RAW_BASE = 'https://raw.githubusercontent.com/reallaksh19/3D_Viewer/main/';

const MASTER_SOURCES = Object.freeze({
  pipingClass: Object.freeze({
    title: 'Piping Class',
    sectionKey: 'pipingClass',
    rowsKey: 'masterRows',
    fieldMapKey: 'fieldMap',
    path: 'docs/Masters/Piping_class_master.json',
    aliases: Object.freeze({
      pipingClass: Object.freeze(['Piping Class', 'PIPING_CLASS', 'Class', 'SPEC', 'Spec']),
      convertedBore: Object.freeze(['convertedBore', 'Converted Bore', 'Size', 'DN', 'NB', 'Bore', 'NPS']),
      componentType: Object.freeze(['Component Type', 'COMPONENT_TYPE', 'Type', 'Item Type']),
      rating: Object.freeze(['Rating', 'RATING', 'Pressure Class', 'Class Rating']),
      materialName: Object.freeze(['Material_Name', 'Material', 'MATERIAL', 'Material Name']),
      schedule: Object.freeze(['Schedule', 'SCHEDULE', 'SCH']),
      wallThickness: Object.freeze(['Wall Thickness', 'WALL_THICKNESS', 'WT', 'WallThickness']),
      corrosion: Object.freeze(['Corrosion', 'Corrosion Allowance', 'CORROSION_ALLOWANCE', 'CA']),
      endCondition: Object.freeze(['End Condition', 'END_CONDITION', 'End Type']),
    }),
  }),
  material: Object.freeze({
    title: 'Material Map',
    sectionKey: 'material',
    rowsKey: 'mapRows',
    fieldMapKey: 'fieldMap',
    path: 'docs/Masters/PCF_MAT_MAP.TXT',
    aliases: Object.freeze({
      code: Object.freeze(['code', 'Code', 'Material Code', 'MATERIAL_CODE', 'CA3']),
      material: Object.freeze(['material', 'Material', 'Material_Name', 'Description', 'Name']),
      spec: Object.freeze(['Spec', 'Specification']),
    }),
  }),
  weight: Object.freeze({
    title: 'Weights / Valve CA8',
    sectionKey: 'weight',
    rowsKey: 'masterRows',
    fieldMapKey: 'fieldMap',
    path: 'docs/Masters/wtValveweights.json',
    aliases: Object.freeze({
      bore: Object.freeze(['convertedBore', 'Converted Bore', 'Size (NPS)', 'Size', 'NPS', 'NS', 'DN', 'NB', 'Bore']),
      rating: Object.freeze(['Rating', 'RATING', 'Class', 'CLASS', 'Pressure Class']),
      length: Object.freeze(['Length (RF-F/F)', 'RF-F/F', 'Length', 'LEN', 'Face To Face', 'faceToFace']),
      valveType: Object.freeze(['Type Description', 'TypeDesc', 'Valve Type', 'Type', 'Description']),
      weight: Object.freeze(['RF/RTJ KG', 'Valve Weight', 'Weight', 'weight', 'valveWeight']),
    }),
  }),
});

function text(value) { return value == null ? '' : String(value); }
function clean(value) { return text(value).replace(/\s+/g, ' ').trim(); }
function rowCount(section, source) {
  const rows = source?.[section.rowsKey];
  return Array.isArray(rows) ? rows.length : 0;
}
function parseConfig(input) {
  try {
    const cfg = JSON.parse(input.value || '{}');
    return cfg && typeof cfg === 'object' && !Array.isArray(cfg) ? cfg : {};
  } catch {
    return null;
  }
}
function ensureSection(config, section) {
  const key = section.sectionKey;
  if (!config[key] || typeof config[key] !== 'object' || Array.isArray(config[key])) config[key] = {};
  if (!config[key][section.fieldMapKey] || typeof config[key][section.fieldMapKey] !== 'object' || Array.isArray(config[key][section.fieldMapKey])) {
    config[key][section.fieldMapKey] = {};
  }
  return config[key];
}
function normalizeHeader(value) {
  return clean(value).toLowerCase().replace(/[_\-/()."'°]/g, ' ').replace(/\s+/g, ' ').trim();
}
function scoreHeader(header, aliases) {
  const h = normalizeHeader(header);
  if (!h) return 0;
  let best = 0;
  for (const alias of aliases || []) {
    const a = normalizeHeader(alias);
    if (!a) continue;
    if (h === a) best = Math.max(best, 100);
    else if (h.includes(a) || a.includes(h)) best = Math.max(best, 82);
    else {
      const hTokens = new Set(h.split(' ').filter(Boolean));
      const aTokens = a.split(' ').filter(Boolean);
      const hits = aTokens.filter((token) => hTokens.has(token)).length;
      if (hits) best = Math.max(best, Math.round((hits / aTokens.length) * 70));
    }
  }
  return best;
}
function headersFromRows(rows) {
  const headers = [];
  const seen = new Set();
  for (const row of Array.isArray(rows) ? rows.slice(0, 50) : []) {
    if (!row || typeof row !== 'object') continue;
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    }
  }
  return headers;
}
function autoFieldMap(rows, section, existingMap = {}) {
  const headers = headersFromRows(rows);
  const next = { ...(existingMap || {}) };
  const claimed = new Set(Object.values(next).filter(Boolean));
  for (const [fieldName, aliases] of Object.entries(section.aliases || {})) {
    if (next[fieldName]) continue;
    let bestHeader = '';
    let bestScore = 0;
    for (const header of headers) {
      if (claimed.has(header)) continue;
      const score = scoreHeader(header, aliases);
      if (score > bestScore) {
        bestScore = score;
        bestHeader = header;
      }
    }
    if (bestScore >= 70 && bestHeader) {
      next[fieldName] = bestHeader;
      claimed.add(bestHeader);
    }
  }
  return next;
}
function parseJsonRows(rawText) {
  const parsed = JSON.parse(rawText || '[]');
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== 'object') return [];
  for (const key of ['rows', 'masterRows', 'mapRows', 'data', 'items']) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }
  for (const value of Object.values(parsed)) {
    if (Array.isArray(value) && value.every((item) => item && typeof item === 'object' && !Array.isArray(item))) return value;
  }
  return [];
}
function parseMaterialMap(rawText) {
  return text(rawText)
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !/^\d{4}$/.test(line))
    .map((line, index) => {
      const match = line.match(/^(\S+)\s+(.+)$/);
      return {
        _rowIndex: index + 1,
        code: match ? match[1].trim() : '',
        material: match ? match[2].trim() : line,
      };
    });
}
function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}
function appBasePath() {
  const first = location.pathname.split('/').filter(Boolean)[0] || '';
  return first ? `/${first}/` : '/';
}
function candidateUrls(masterPath) {
  const encoded = masterPath.split('/').map(encodeURIComponent).join('/').replace(/%2F/g, '/');
  const filename = masterPath.split('/').pop();
  const origin = location.origin;
  return unique([
    new URL(`../../${masterPath}`, import.meta.url).href,
    `${origin}${appBasePath()}${masterPath}`,
    `${origin}/${masterPath}`,
    `${RAW_BASE}${encoded}`,
    filename ? `${RAW_BASE}docs/Masters/${encodeURIComponent(filename)}` : '',
  ]);
}
async function fetchTextFromCandidates(section) {
  const errors = [];
  for (const url of candidateUrls(section.path)) {
    try {
      const response = await fetch(url, { cache: 'no-store', mode: 'cors' });
      if (!response.ok) {
        errors.push(`${url}: HTTP ${response.status}`);
        continue;
      }
      const rawText = await response.text();
      if (!clean(rawText)) {
        errors.push(`${url}: empty response`);
        continue;
      }
      return { rawText, url };
    } catch (error) {
      errors.push(`${url}: ${clean(error?.message || error)}`);
    }
  }
  throw new Error(`${section.title} default master failed to load. Tried: ${errors.join(' | ')}`);
}
async function fetchRows(sectionKey, section) {
  const { rawText, url } = await fetchTextFromCandidates(section);
  const rows = sectionKey === 'material' ? parseMaterialMap(rawText) : parseJsonRows(rawText);
  if (!Array.isArray(rows) || rows.length <= 0) throw new Error(`${section.title} default master loaded 0 rows from ${url}`);
  return { rows, url };
}
function dispatchConfigChange(input) {
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
function statusHost() {
  let host = document.getElementById(STATUS_ID);
  if (host) return host;
  host = document.createElement('div');
  host.id = STATUS_ID;
  host.style.cssText = 'margin:8px 0;padding:8px 10px;border:1px solid #2f4770;border-radius:8px;background:#0f1b2c;color:#b9d7ff;font-size:12px;';
  return host;
}
function showStatus(message, tone = 'info') {
  const phaseTitle = Array.from(document.querySelectorAll('.model-converters-workflow-detail-title'))
    .find((el) => /Import Masters|Run|Config/i.test(clean(el.textContent)));
  if (!phaseTitle) return;
  const host = statusHost();
  host.textContent = message;
  host.style.borderColor = tone === 'error' ? '#7f3040' : tone === 'ok' ? '#2b7656' : '#2f4770';
  host.style.color = tone === 'error' ? '#ffc2c2' : tone === 'ok' ? '#7dffc0' : '#b9d7ff';
  if (!host.isConnected) phaseTitle.insertAdjacentElement('afterend', host);
}
function maybeRefreshWorkflow() {
  const activeImportTab = Array.from(document.querySelectorAll('[data-xml-cii-phase]'))
    .find((button) => button.classList.contains('is-active') && button.getAttribute('data-xml-cii-phase') === 'import-masters');
  if (activeImportTab) setTimeout(() => activeImportTab.click(), 30);
}
function missingMasterSignature(config) {
  return Object.entries(MASTER_SOURCES)
    .map(([key, section]) => `${key}:${rowCount(section, config[section.sectionKey])}`)
    .join('|');
}

let busy = false;
let lastAttemptSignature = '';
let lastFailureSignature = '';
let failureNotified = false;

async function autoloadMasters(input) {
  if (busy) return;
  const config = parseConfig(input);
  if (config == null) return;
  if (config.disableDefaultMasterAutoload === true || config._disableDefaultMasterAutoload === true) return;

  const signature = missingMasterSignature(config);
  const missing = Object.entries(MASTER_SOURCES).filter(([, section]) => {
    const target = config[section.sectionKey];
    return rowCount(section, target) <= 0;
  });
  if (!missing.length) return;
  if (signature === lastAttemptSignature || signature === lastFailureSignature) return;

  busy = true;
  lastAttemptSignature = signature;
  showStatus(`Autoloading ${missing.map(([, section]) => section.title).join(', ')} from docs/Masters…`);
  const loaded = [];
  const errors = [];
  try {
    for (const [sectionKey, section] of missing) {
      try {
        const { rows, url } = await fetchRows(sectionKey, section);
        const target = ensureSection(config, section);
        target[section.rowsKey] = rows;
        target[section.fieldMapKey] = autoFieldMap(rows, section, target[section.fieldMapKey]);
        target.masterUrl = target.masterUrl || url;
        target.defaultUrl = target.defaultUrl || url;
        target._autoloadedFrom = url;
        target._autoloadedRows = rows.length;
        loaded.push(`${section.title}: ${rows.length} row(s)`);
      } catch (error) {
        errors.push(`${section.title}: ${clean(error?.message || error)}`);
      }
    }

    if (loaded.length) {
      config._defaultMastersAutoloaded = {
        loadedAt: new Date().toISOString(),
        source: 'docs/Masters + raw.githubusercontent.com fallback',
        mode: 'config-only-no-preview',
        counts: Object.fromEntries(Object.entries(MASTER_SOURCES).map(([key, section]) => [key, rowCount(section, config[section.sectionKey])])),
      };
      input.value = JSON.stringify(config, null, 2);
      dispatchConfigChange(input);
      showStatus(`Autoloaded ${loaded.join(' · ')}. Piping Class is config-only; full preview was not rendered.`, 'ok');
      notify({ level: 'success', title: 'XML->CII Masters', message: `Autoloaded ${loaded.join(' · ')}.` });
      maybeRefreshWorkflow();
    }

    if (errors.length) {
      lastFailureSignature = missingMasterSignature(config);
      const message = `Default master autoload skipped for some masters: ${errors.join(' || ')}`;
      showStatus(message, 'error');
      if (!failureNotified) {
        failureNotified = true;
        notify({ level: 'error', title: 'XML->CII Masters', message });
      }
    }
  } finally {
    busy = false;
  }
}
let raf = 0;
let observer = null;
function schedule() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const input = document.querySelector(INPUT_SELECTOR);
    if (!input) return;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    autoloadMasters(input).catch((error) => console.warn('XML->CII master autoload failed', error));
  });
}

export function installXmlCiiDefaultMasterAutoload() {
  if (window[FLAG]) return;
  window[FLAG] = true;
  schedule();
  observer = new MutationObserver(() => {
    if (document.querySelector(INPUT_SELECTOR)) schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('[data-xml-cii-phase], [data-json-popup-key="supportConfigJson"], [data-xml-cii-load-default]')) schedule();
  }, true);
  document.addEventListener('change', (event) => {
    if (event.target?.matches?.(INPUT_SELECTOR)) {
      lastAttemptSignature = '';
      lastFailureSignature = '';
      schedule();
    }
  }, true);
}

installXmlCiiDefaultMasterAutoload();
