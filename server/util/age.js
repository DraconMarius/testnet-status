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

function getTime() {
    const now = new Date();

    // Get minutes and round to the nearest half-hour block
    const minutes = now.getMinutes();

    if (minutes < 15) {
        // Round down to the nearest hour (XX:00)
        now.setMinutes(0, 0, 0);
    } else if (minutes >= 15 && minutes < 45) {
        // Round to the nearest half-hour (XX:30)
        now.setMinutes(30, 0, 0);
    } else {
        // Round up to the next hour (XX:00 of the next hour)
        now.setMinutes(0, 0, 0);
        now.setHours(now.getHours() + 1); // Move to the next hour
    }

    return now;
}

module.exports = { calcAge, getTime }