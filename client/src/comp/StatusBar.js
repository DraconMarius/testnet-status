import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import scanUrl from '../util/scan';

import ethereumIcon from '../assets/etherscan-logo.png'
import arbitrumIcon from '../assets/arbitrum-logo.png'
import optimismIcon from '../assets/optimism-logo.png'
import polygonIcon from '../assets/polygon-logo.png'

function StatusBar({ res, selectedNetwork }) {
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [clickedIndex, setClickedIndex] = useState(null);
    const [icon, setIcon] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {

        if ((selectedNetwork) === "Polygon") {
            setIcon(polygonIcon)
        } else if ((selectedNetwork) === "Arbitrum") {
            setIcon(arbitrumIcon)
        } else if ((selectedNetwork) === "Optimism") {
            setIcon(optimismIcon)
        } else {
            setIcon(ethereumIcon)
        }

    }, [selectedNetwork]);

    // Framer Motion scroll hook
    const { scrollXProgress } = useScroll({ container: containerRef });

    if (!selectedNetwork || !res || !res[selectedNetwork]) return null;

    const entries = res[selectedNetwork];

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };



    return (
        <AnimatePresence>

            <motion.div
                layout className="status-container" ref={containerRef} style={{ position: 'relative' }}>
                {entries.map((entry, index) => {
                    const currentEntryDate = new Date(entry.time).toISOString().slice(0, 10);
                    const previousEntryDate = index > 0 ? new Date(entries[index - 1].time).toISOString().slice(0, 10) : null;

                    const parsedDate = `${new Date(entry.time).toUTCString()}`;

                    return (
                        <motion.div className="is-flex is-justify-content-flex-start is-align-items-flex-end" key={index}>
                            {currentEntryDate !== previousEntryDate && (
                                <div className="date-marker">
                                    {formatDate(currentEntryDate)}
                                </div>
                            )}

                            <motion.div
                                layout
                                className={`status-item is-flex ${focusedIndex === index ? 'is-focused' : 'is-faded'} ${entry.tx?.status === 'pending' ? 'has-background-warning' : !entry.tx ? 'has-background-danger' : 'has-backround-success'}`}
                                onHoverStart={() => clickedIndex === null && setFocusedIndex(index)}
                                onHoverEnd={() => clickedIndex === null && setFocusedIndex(null)}
                                onClick={() => setClickedIndex(clickedIndex === index ? null : index)}
                                initial={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 100, damping: 60 }}
                                style={{
                                    position: 'relative',
                                    transformOrigin: 'center',
                                }}
                            >
                                <div className="time-marker">
                                    {formatTime(entry.time)}
                                </div>
                            </motion.div>

                            {focusedIndex === index && (
                                <motion.div
                                    layout
                                    className="status-info "
                                    initial={{ opacity: 0, y: -250 }}
                                    animate={{ opacity: 1, y: -50 }}
                                    exit={{ opacity: 0, y: -200 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        position: 'absolute',
                                        transformOrigin: 'center',
                                        left: `calc(50% + ${scrollXProgress}%)`,
                                        // // transform: 'translateX(-50%)',
                                        zIndex: 3,
                                    }}
                                >
                                    <div className="container">
                                        <button className="delete is-pulled-right" aria-label="close" onClick={() => { setClickedIndex(null); setFocusedIndex(null); }}></button>
                                    </div>
                                    <table className="table is-bordered is-striped is-narrow">
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
                                                <td> <a href={`${scanUrl[selectedNetwork]}tx/${entry.tx?.tx_hash}`} className="is-pulled-right pl-3 pr-2" target="_blank" rel="noreferrer">
                                                    <span className="icon is-small is-align-self-center"  ><img src={icon} /></span>
                                                </a><strong>Tx Hash:</strong></td>
                                                <td>  <span className="is-align-item-center">
                                                    <span>{entry.tx?.tx_hash || 'N/A'} </span>

                                                </span></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Latency:</strong></td>
                                                <td>{entry.tx?.latency || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>gasPrice:</strong></td>
                                                <td>{`${entry.tx?.gas_price} gwei` || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>maxPriorityFee:</strong></td>
                                                <td>{`${entry.tx?.maxPriorityFee_perGas} gwei` || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>maxFee / Gas:</strong></td>
                                                <td>{`${entry.tx?.maxFee_perGas} gwei` || 'N/A'}</td>
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
                    );
                })}
            </motion.div>
            <div className="container">
                <p className="title is-6 has-text-left is-align-items-flex-end">{selectedNetwork}</p>
            </div>
        </AnimatePresence>
    );
}

export default StatusBar;
