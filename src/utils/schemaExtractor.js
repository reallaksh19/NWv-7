/**
 * Extracts Schema.org JSON-LD structured data from HTML.
 * Focuses on Event, Festival, and SaleEvent types for Up Ahead.
 */

export function extractSchemaEventsFromHTML(html) {
    if (!html) return null;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const scriptTags = doc.querySelectorAll('script[type="application/ld+json"]');

        for (const script of scriptTags) {
            try {
                const data = JSON.parse(script.textContent);
                // JSON-LD can be an array of objects or a single object
                const items = Array.isArray(data) ? data : [data];

                for (const item of items) {
                    // Check for @graph which sometimes wraps multiple entities
                    const entities = item['@graph'] ? item['@graph'] : [item];

                    for (const entity of entities) {
                        const type = entity['@type'];
                        const types = Array.isArray(type) ? type : [type];

                        if (types.some(t => ['Event', 'Festival', 'SaleEvent', 'MusicEvent', 'SportsEvent', 'TheaterEvent', 'ExhibitionEvent', 'ChildrensEvent'].includes(t))) {
                            return {
                                name: entity.name || null,
                                startDate: entity.startDate || null,
                                endDate: entity.endDate || null,
                                locationName: entity.location?.name || entity.location?.address?.addressLocality || null,
                                url: entity.url || null
                            };
                        }
                    }
                }
            } catch {
                // Ignore parse errors on individual scripts
            }
        }
    } catch {
        // Ignore DOM parsing errors
    }

    return null;
}
