var stats = {
    scssFilesFound: 0,
    scssFilesWithErrors: 0,
    totalErros: 0
}

var appStats = {
    getStats() {
        return stats;
    },
    updateStats(field) {
        let num = stats[field];
        stats[field]++
    }
}

module.exports = appStats;
