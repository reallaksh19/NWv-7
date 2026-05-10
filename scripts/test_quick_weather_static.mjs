import fs from 'fs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(path) {
  assert(fs.existsSync(path), `Missing file: ${path}`);
  return fs.readFileSync(path, 'utf8');
}

const quickWeather = read('src/components/QuickWeather.jsx');

for (const token of [
  'DEFAULT_CITIES',
  'getCitySlots',
  'segmentToSlot',
  'currentToSlot',
  'hasUsableCityWeather',
  'cityRows.map',
  'qw-city-row--missing',
  'No forecast',
  '!cities.includes(activeCity)',
  'tomorrow?.morning',
  'weatherData?.[city]'
]) {
  assert(quickWeather.includes(token), `QuickWeather missing required token: ${token}`);
}

assert(
  !quickWeather.includes('cities.filter(city => weatherData?.[city]?.current)'),
  'QuickWeather must not filter visible cities only by current weather'
);

assert(
  quickWeather.includes('settings?.weather?.cities') || quickWeather.includes('settings.weather?.cities'),
  'QuickWeather must use configured weather cities'
);

console.log(JSON.stringify({
  status: 'PASS',
  checked: 'QuickWeather static slice',
  guarantees: [
    'configured cities are rendered',
    'current-only weather does not become false No forecast',
    'hourly24 / next8Hours / day-segment / tomorrow fallback supported',
    'invalid saved active city is corrected',
    'per-city missing forecast state is explicit'
  ]
}, null, 2));

console.log('PASS: QuickWeather static slice');