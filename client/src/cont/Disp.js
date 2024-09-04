import React, { useState, useEffect, useRef } from 'react';
import Nav from './Nav';
import StatusBar from '../comp/StatusBar';
import loadingIcon from '../assets/loading.gif';
import { getDB, refresh } from '../util/api';
import { motion } from 'framer-motion';

function Disp() {
    const [loading, setLoading] = useState(true);
    const [db, setDB] = useState(null);
    const wsUri = process.env.REACT_APP_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:3001`;
    const wsRef = useRef(null);

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

    const connectWebSocket = () => {
        if (wsRef.current) return;

        const wss = new WebSocket(wsUri);

        wsRef.current = wss;

        wss.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        wss.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log('WebSocket message received:', data);

            // If the message indicates an update, refresh the data
            if (data.message === 'update') {
                console.log('Data update received from WebSocket');
                fetchData();  // Refresh the data on the frontend
            }
        };


        wss.onclose = () => {
            console.log('WebSocket connection closed');
        };

        wss.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    const disconnectWebSocket = () => {
        if (wsRef.current) {
            // Close WebSocket connection
            wsRef.current.close();
            // Reset WebSocket reference
            wsRef.current = null;
        }
    };

    useEffect(() => {
        fetchData();

        const handleFocus = () => {
            console.log('Window in focus, connecting WebSocket');
            connectWebSocket();
        };

        const handleBlur = () => {
            console.log('Window out of focus, closing WebSocket');
            disconnectWebSocket();
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        connectWebSocket();

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            disconnectWebSocket();
        };
    }, []);

    return (
        <motion.div className="hero-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loading || !db ? (
                <motion.div className="modal is-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="modal-background">
                        <div className=" is-flex is-justify-content-center is-align-items-center">
                            <motion.div
                                className="modal-content is-flex is-justify-content-center"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                <div className="image is-48x48 is-align-self-center">
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
                    <div className="hero-head has-text-centered">
                        <Nav />
                        <div className="container">
                            <div>Hero-head placeholder for scroll status maybe</div>
                        </div>
                    </div>
                    <div className="hero-body is-justify-content-center">
                        <div className="container has-text-centered">

                            {Object.keys(db).map((networkKey) => (
                                <div className="container is-justify-content-center" key={networkKey}>
                                    <div className="block">
                                        <h2 className="title is-6 has-text-left">{networkKey}</h2>
                                    </div>
                                    <StatusBar
                                        res={db}
                                        selectedNetwork={networkKey}
                                    />
                                </div>
                            ))}

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
