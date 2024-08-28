import React, { useState } from 'react';
import { motion } from 'framer-motion';


function StatusBar({ res, selectedNetwork }) {
    const [focusedIndex, setFocusedIndex] = useState(null);

    if (!selectedNetwork || !res || !res[selectedNetwork]) return null;

    const entries = res[selectedNetwork];

    // Helper function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="status-container">
            {entries.map((entry, index) => {
                const currentEntryDate = new Date(entry.time).toDateString();
                const previousEntryDate = index > 0 ? new Date(entries[index - 1].time).toDateString() : null;

                return (
                    <div key={entry.time} className="status-wrapper" style={{ position: 'relative' }}>
                        {/* Display date marker above the first bar of each new day */}
                        {currentEntryDate !== previousEntryDate && (
                            <div className="date-marker">
                                {formatDate(entry.time)}
                            </div>
                        )}

                        <motion.div
                            className="status-item"
                            onHoverStart={() => setFocusedIndex(index)}
                            onHoverEnd={() => setFocusedIndex(null)}
                            initial={{ scale: 1 }}
                            animate={focusedIndex === index ? { scale: 1.2 } : { scale: 1 }} /* Lifting effect */
                        >
                            {focusedIndex === index && (
                                <motion.div
                                    className="status-pane"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: -100 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                >
                                    <div className="status-info">
                                        <p>time: {entry.avg.timestamp}</p>
                                        <p>Tx Hash: {entry.tx.tx_hash}</p>
                                        <p>Latency: {entry.tx.latency}</p>
                                        <p>Avg Throughput: {entry.avg.avgThroughput}</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                );
            })}
        </div>
    );
}

export default StatusBar;
