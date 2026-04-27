import fs from 'fs';

const snapshot = JSON.parse(fs.readFileSync('public/data/market_snapshot.json', 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(Array.isArray(snapshot.indices), 'indices must be an array');
assert(snapshot.indices.length >= 2, 'indices must contain at least 2 entries');
assert(snapshot.generatedAt || snapshot.generated_at, 'generatedAt missing');

console.log(JSON.stringify({
  indices: snapshot.indices.length,
  mutualFunds: snapshot.mutualFunds?.length || 0,
  gainers: snapshot.movers?.gainers?.length || 0,
  losers: snapshot.movers?.losers?.length || 0,
  sectorals: snapshot.sectorals?.length || 0,
  commodities: snapshot.commodities?.length || 0,
  currencies: snapshot.currencies?.length || 0,
  fiidiiDate: snapshot.fiidii?.date || null
}, null, 2));

console.log('PASS: market snapshot integrity');
