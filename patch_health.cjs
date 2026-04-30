const fs = require('fs');
let code = fs.readFileSync('src/intelligence/feedHealthMonitor.js', 'utf8');

code = code.replace(/function saveStore\(store\) \{\n[\s\S]*?\n\}/, `function saveStore(store) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch (e) {
        if (e) { /* Fail silently */ }
    }
}`);
// And loadStore
code = code.replace(/function loadStore\(\) \{\n[\s\S]*?\n\}/, `function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (e) {
        if (e) { return {}; }
        return {};
    }
}`);

fs.writeFileSync('src/intelligence/feedHealthMonitor.js', code);
