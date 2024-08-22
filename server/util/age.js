function calcAge(startT, endT) {
    const start = new Date(startT);
    const end = new Date(endT);

    const diffMs = end - start; // milliseconds between now & transaction date

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // days between
    if (diffDays < 1) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 1) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            if (diffMinutes < 1) {
                const diffSeconds = Math.floor(diffMs / 1000); // seconds between
                if (diffSeconds < 1) {
                    return `${diffMs} milliseconds`;
                }
                return `${diffSeconds} seconds`;
            }
            return `${diffMinutes} minutes`;
        }
        return `${diffHours} hours`;
    }
    return `${diffDays} days`;
}

module.exports = { calcAge }