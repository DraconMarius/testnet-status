import React, { useState, useEffect } from 'react';

import logo from '../assets/alchemylogo.png';

import ethereumIcon from '../assets/etherscan-logo.png'
import arbitrumIcon from '../assets/arbitrum-logo.png'
import optimismIcon from '../assets/optimism-logo.png'
import polygonIcon from '../assets/polygon-logo.png'


function Sidebar({ res }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState(null);

    const handleMobile = () => {
        // document.getElementById('sidebar').classList.toggle('is-active');
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNetworkSelect = (network) => {
        setSelectedNetwork(network);
    };

    return (
        <div className="container">
            <button
                role="button"
                onClick={handleMobile}
                className={`button navbar-burger`}
                aria-label="menu"
                aria-expanded="false"
                data-target="sidebar"
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </button>
            <div
                className={`sidebar ${isMenuOpen ? 'is-active' : ''}`}
                id="sidebar"
                style={{
                    position: 'fixed',
                    left: isMenuOpen ? '0' : '-250px',
                    top: '0',
                    width: '250px',
                    height: '100%',
                    // backgroundColor: '#363636',
                    // padding: '20px',
                    zIndex: 15,
                    transition: 'left 0.3s ease',
                }}
            >
                <a className="navbar-item" href="https://www.alchemy.com">
                    <img src={logo} alt="alchemylogo" style={{ marginBottom: '20px' }} />
                </a>
                <aside className="menu">
                    <ul className="menu-list">
                        <li>
                            <a href="/">Home</a>
                        </li>
                    </ul>
                    {/* Display networks as tabs when data is available */}
                    {res && Object.keys(res).length > 0 && (
                        <>
                            <p className="menu-label has-text-light">Networks</p>
                            <ul className="menu-list">
                                {Object.keys(res).map((networkKey) => (
                                    <li key={networkKey}>
                                        <a
                                            onClick={() => handleNetworkSelect(networkKey)}
                                            className={selectedNetwork === networkKey ? 'is-active' : ''}
                                        >
                                            <img
                                                src={getNetworkIcon(networkKey)}
                                                alt={`${networkKey} logo`}
                                                style={{ marginRight: '10px', width: '20px' }}
                                            />
                                            {networkKey} ({res[networkKey].length} data points)
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </aside>
            </div>

            <div
                className={`sidebarStatic`}
                style={{
                    position: 'fixed',
                    left: '0',
                    top: '0',
                    width: '250px',
                    height: '100%',
                    zIndex: 15,
                }}
            >
                <a className="navbar-item" href="https://www.alchemy.com">
                    <img src={logo} alt="alchemylogo" style={{ marginBottom: '20px' }} />
                </a>
                <aside className="menu">
                    <ul className="menu-list">
                        <li>
                            <a href="/">Home</a>
                        </li>
                    </ul>
                    {/* Display networks as tabs when data is available */}
                    {res && Object.keys(res).length > 0 && (
                        <>
                            <p className="menu-label has-text-light">Networks</p>
                            <ul className="menu-list">
                                {Object.keys(res).map((networkKey) => (
                                    <li key={networkKey}>
                                        <a
                                            onClick={() => handleNetworkSelect(networkKey)}
                                            className={selectedNetwork === networkKey ? 'is-active' : ''}
                                        >
                                            <img
                                                src={getNetworkIcon(networkKey)}
                                                alt={`${networkKey} logo`}
                                                style={{ marginRight: '10px', width: '20px' }}
                                            />
                                            {networkKey} ({res[networkKey].length} data points)
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </aside>
            </div>

            {isMenuOpen && (
                <div
                    className="overlay"
                    onClick={handleMobile}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 10,
                    }}
                />
            )}
        </div>
    );
}

const getNetworkIcon = (networkName) => {
    switch (networkName) {
        case 'Ethereum':
            return ethereumIcon;
        case 'Arbitrum':
            return arbitrumIcon;
        case 'Optimism':
            return optimismIcon;
        case 'Polygon':
            return polygonIcon;
        default:
            return '';
    }
};

export default Sidebar;