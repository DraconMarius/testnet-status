import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

function StatusBar({ res, selectedNetwork }) {
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [scrollPos, setScrollPos] = useState(0); // Track scroll position
    const containerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                setScrollPos(containerRef.current.scrollLeft);
            }
        };

        const container = containerRef.current;
        container.addEventListener('scroll', handleScroll);

        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    if (!selectedNetwork || !res || !res[selectedNetwork]) return null;

    const entries = res[selectedNetwork];

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
    };

    return (
        <div className="status-container section" ref={containerRef} style={{ position: 'relative' }}>
            {entries.map((entry, index) => {
                const currentEntryDate = new Date(entry.time).toISOString().slice(0, 10);
                const previousEntryDate = index > 0 ? new Date(entries[index - 1].time).toISOString().slice(0, 10) : null;

                const parsedDate = `${new Date(entry.time).toUTCString()}`;
                return (
                    <div className="is-flex" key={index}>
                        {currentEntryDate !== previousEntryDate && (
                            <div className="date-marker">
                                {formatDate(currentEntryDate)}
                            </div>
                        )}

                        <motion.div
                            className={`status-item is-flex ${focusedIndex === index ? 'is-focused' : 'is-faded'} ${entry.tx?.status === 'pending' ? 'has-background-warning' : !entry.tx ? 'has-background-danger' : 'has-backround-success'}`}
                            onHoverStart={() => setFocusedIndex(index)}
                            onHoverEnd={() => setFocusedIndex(null)}
                            initial={{ scale: 1 }}
                            animate={focusedIndex === index ? { scale: 1.3 } : { scale: 1 }}
                            transition={{ type: 'spring', stiffness: 100, damping: 60 }}
                            style={{
                                position: 'relative',
                                transformOrigin: 'center',
                            }}
                        />

                        {/* Pop-up content positioned in the center of the visible container */}
                        {focusedIndex === index && (
                            <motion.div
                                className="status-info table-container"
                                initial={{ opacity: 0, y: -150 }}
                                animate={{ opacity: 1, y: -100 }}
                                transition={{ duration: 0.8 }}
                                style={{
                                    position: 'absolute',
                                    left: `${scrollPos + containerRef.current.clientWidth / 3.6}px`, // Center it within the container
                                    transform: 'translateX(-50%)', // Keep it centered based on scroll position
                                    zIndex: 2,
                                }}
                            >
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <td><strong>Time:</strong></td>
                                            <td>{parsedDate}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Status:</strong></td>
                                            <td>
                                                <div className={`tag ${(entry.tx?.status === "complete") ? 'is-success' : 'is-warning'}`}>
                                                    {entry.tx?.status || 'N/A'}
                                                </div>
                                            </td>
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
                                            <td><strong>maxPriorityFee / Gas:</strong></td>
                                            <td>{`${entry.avg?.maxPriorityFee_perGas} gwei` || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>maxFee / Gas:</strong></td>
                                            <td>{`${entry.avg?.maxFee_perGas} gwei` || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Throughput:</strong></td>
                                            <td>{`${entry.avg?.avgThroughput} tx per sec` || 'N/A'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default StatusBar;
