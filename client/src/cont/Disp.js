import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StatusBar from '../comp/StatusBar';
import loadingIcon from '../assets/loading.gif';
import { getDB } from '../util/api';
import { motion } from 'framer-motion';

function Disp() {
    const [loading, setLoading] = useState(true);
    const [db, setDB] = useState(null);
    const [selectedNetwork, setSelectedNetwork] = useState(null);  // This stores the selected network
    const [focusedTimeSlot, setFocusedTimeSlot] = useState(null);  // This stores the focused time slot

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getDB();
                console.log('Fetched data:', res);
                setDB(res);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <motion.div className="hero-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loading || !db ? (
                <motion.div className="modal is-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="modal-background">
                        <div className="modal-content is-flex is-justify-content-center is-align-items-center">
                            <motion.div
                                className="container is-flex is-justify-content-center"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                <div className="image is-1by1 is-48x48 is-align-self-center">
                                    <img src={loadingIcon} alt="loading gif" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.section
                    className="hero is-fullheight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="hero-head">
                        <div className="container">
                            <div>Hero-head placeholder for scroll status maybe</div>
                        </div>
                        <div className="container columns has-text-centered">
                            <div className="column is-2">
                                <Sidebar res={db} setSelectedNetwork={setSelectedNetwork} />
                            </div>
                        </div>
                    </div>
                    <div className="hero-body">

                        <div className="column is-8">
                        </div>
                        <div className="column is-4 is-justify-content-bottom">
                            <StatusBar
                                res={db}
                                selectedNetwork={selectedNetwork}  // Pass the selected network
                                focusedTimeSlot={focusedTimeSlot}  // Pass the focused time slot
                                setFocusedTimeSlot={setFocusedTimeSlot}  // Function to update the focused time slot
                            />
                            {/* Additional content */}
                        </div>

                    </div>

                    <div className="hero-foot">
                        <nav className="tabs is-boxed is-fullwidth">
                            <div className="container pt-0 has-text-warning">
                                <ul>
                                    <li>
                                        <a href="https://docs.alchemy.com" target="_blank" rel="noreferrer">Alchemy Docs</a>
                                    </li>
                                    <li>
                                        <a href="https://github.com/DraconMarius/testnet-status" target="_blank" rel="noreferrer">Github</a>
                                    </li>
                                    <li>
                                        <a href="https://www.linkedin.com/in/mari-ma-70771585" target="_blank" rel="noreferrer">Contact</a>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                </motion.section>
            )}
        </motion.div>
    );
}

export default Disp;
