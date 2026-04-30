self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    if (type === 'CHECK_PRICES') {
        const { marketData, thresholds } = payload;
        const alerts = [];

        if (marketData && marketData.indices) {
            marketData.indices.forEach(index => {
                const threshold = thresholds && thresholds[index.name];
                if (threshold) {
                    const currentValue = parseFloat(String(index.value).replace(/,/g, ''));
                    if (currentValue >= threshold.upper) {
                        alerts.push({ message: `${index.name} has crossed upper threshold of ${threshold.upper}` });
                    } else if (currentValue <= threshold.lower) {
                        alerts.push({ message: `${index.name} has dropped below lower threshold of ${threshold.lower}` });
                    }
                }
            });
        }

        self.postMessage({ type: 'ALERTS_GENERATED', payload: alerts });
    }
});