import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import loadingIcon from '../assets/loading.gif'


function Disp() {
    const [loading, setLoading] = useState();
    // useEffect(() => {

    // }, []);

    // const res = { Eth: [], Polygon: [], Arbitrum: [], Base: [] };

    return (
        <div className="hero-background">
            {loading ? (
                <div className="modal is-active">
                    <div className="modal-background">
                        <div className="modal-content is-flex is-justify-content-center is-align-items-center">
                            <div className="container is-flex is-justify-content-center">
                                <div className="image is-1by1 is-48x48 is-align-self-center">
                                    <img src={loadingIcon} alt="loading gif" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <section className="hero is-fullheight">
                    <div className="hero-head">
                        <div className="container">
                            <>hero-head placeholder for scroll status maybe</>
                        </div>
                        <div className="container columns has-text-centered">
                            <div className="column is-2">
                                <Sidebar />
                            </div>
                        </div>
                    </div>
                    <div className="hero-body">
                        <div className="container columns has-text-centered">
                            <div className="column">

                            </div>
                            <div className="column is-8">
                                {/* <MainContent /> */}
                                test main content
                            </div>
                            <div className="column is-2">
                                {/* <Sidebar /> */}
                                potential dial
                            </div>

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
                </section >
            )

            }
        </div >
    );
}

export default Disp;