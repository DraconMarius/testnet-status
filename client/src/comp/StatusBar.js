import React, { useState } from 'react';
import { motion } from 'framer-motion';

function StatusBar({ res, selectedNetwork }) {
    const [focusedIndex, setFocusedIndex] = useState(null);

    if (!selectedNetwork || !res || !res[selectedNetwork]) return null;

    const entries = res[selectedNetwork];

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
    };

    return (
        <div className="status-container container">
            {entries.map((entry, index) => {
                const currentEntryDate = new Date(entry.time).toISOString().slice(0, 10);
                const previousEntryDate = index > 0 ? new Date(entries[index - 1].time).toISOString().slice(0, 10) : null;

                const parsedDate = `${new Date(entry.time).toUTCString()}`
                return (

                    <div className="is-flex" key={index}>
                        {currentEntryDate !== previousEntryDate && (
                            <div className="date-marker">
                                {formatDate(currentEntryDate)}
                            </div>
                        )}


                        <motion.div
                            className={`status-item is-flex ${focusedIndex === index ? 'is-focused' : 'is-faded'}`}
                            onHoverStart={() => setFocusedIndex(index)}
                            onHoverEnd={() => setFocusedIndex(null)}
                            initial={{ scale: 1 }}
                            animate={focusedIndex === index ? { scale: 1 } : { scale: 1 }}
                            transition={{ type: 'spring', stiffness: 100, damping: 60 }}
                        >

                            {focusedIndex === index && (
                                <motion.div
                                    className="status-info"
                                    initial={{ opacity: 0, y: 0, x: 0 }}
                                    animate={{ opacity: 1, y: -75, x: 0, zIndex: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <table className="table">
                                        <tbody>
                                            <tr>
                                                <td><strong>Time:</strong></td>
                                                <td>{parsedDate}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Status:</strong></td>
                                                <td>{entry.tx?.status || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Tx Hash:</strong></td>
                                                <td>{entry.tx?.tx_hash || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Latency:</strong></td>
                                                <td>{entry.tx?.latency || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Throughput:</strong></td>
                                                <td>{`${entry.avg?.avgThroughput} tx per sec` || 'N/A'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
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
