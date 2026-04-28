import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '../benchmarks/upahead');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const TOTAL_STORIES = 250;

const LOCATIONS = {
    'Chennai': 40,
    'T. Nagar': 25,
    'Adayar': 20,
    'Mylapore': 18,
    'Besant Nagar': 15,
    'Nungambakkam': 22,
    'Velachery': 28,
    'Tambaram': 18,
    'Kanchipuram': 12,
    'Tirupati': 8,
    'No_Location': 44
};

const today = new Date('2026-04-28T12:00:00Z');
const days = {
    1: 25,
    2: 22,
    3: 20,
    4: 18,
    5: 20,
    6: 22,
    7: 18,
    past: 105
};

const duplicateSpecs = [
    { cat: 'civic', unique: 15, total: 45, variants: 3, titleBase: 'Local Road Closure' },
    { cat: 'traffic', unique: 8, total: 24, variants: 3, titleBase: 'Traffic Alert Major Highway' },
    { cat: 'shopping', unique: 12, total: 36, variants: 3, titleBase: 'Grand Mega Sale End Of Season' },
    { cat: 'events', unique: 10, total: 20, variants: 2, titleBase: 'Summer Music Festival Open' },
    { cat: 'food', unique: 7, total: 14, variants: 2, titleBase: 'New Grand Restaurant Opening' },
    { cat: 'other', unique: 48, total: 96, variants: 2, titleBase: 'General City News Update' },
    { cat: 'other', unique: 15, total: 15, variants: 1, titleBase: 'Miscellaneous Info Snippet' }
];

let storyIdCounter = 1;

function generateStories() {
    const stories = [];
    let locationPool = [];
    for (const [loc, count] of Object.entries(LOCATIONS)) {
        for (let i = 0; i < count; i++) {
            locationPool.push(loc === 'No_Location' ? null : loc);
        }
    }
    locationPool = locationPool.sort(() => Math.random() - 0.5);

    let dayPool = [];
    for (const [day, count] of Object.entries(days)) {
        for (let i = 0; i < count; i++) {
            if (day === 'past') {
                dayPool.push(new Date(today.getTime() - (8 + Math.floor(Math.random() * 20)) * 86400000));
            } else {
                dayPool.push(new Date(today.getTime() + (parseInt(day) - 1) * 86400000));
            }
        }
    }
    dayPool = dayPool.sort(() => Math.random() - 0.5);

    for (const spec of duplicateSpecs) {
        for (let i = 0; i < spec.unique; i++) {
            const baseId = storyIdCounter++;
            const category = spec.cat;
            const baseTitle = `${spec.titleBase} Number ${baseId}`;

            // We need to ensure exactly `spec.unique` stories are produced after dedup
            // We'll vary the link for each BASE story, but keep it the SAME for its VARIANTS.
            const baseLink = `http://example.com/story/${baseId}`;

            for (let v = 0; v < spec.variants; v++) {
                const loc = locationPool.pop();
                const d = dayPool.pop();

                // If it's a variant, use the same exact title and link so it deduplicates perfectly
                stories.push({
                    id: `story_${baseId}_var_${v}`,
                    title: baseTitle, // exact title match
                    description: `Details regarding ${baseTitle}. Reporting from ${loc || 'General'} on ${d.toISOString().split('T')[0]}.`,
                    category: category,
                    location: loc,
                    date: d.toISOString(),
                    source: `Source_${v + 1}`,
                    link: baseLink // exact link match
                });
            }
        }
    }

    return stories;
}

const inputData = generateStories();
fs.writeFileSync(path.join(outputDir, 'bm2_input.json'), JSON.stringify(inputData, null, 2));

console.log("BM2 Input dataset generated: benchmarks/upahead/bm2_input.json");
