import React, { useState, useEffect } from 'react';

import logo from '../assets/alchemylogo.png';



import { useSearch } from './searchContext';

import ethereumIcon from '../assets/etherscan-logo.png'
import arbitrumIcon from '../assets/arbitrum-logo.png'
import optimismIcon from '../assets/optimism-logo.png'
import polygonIcon from '../assets/polygon-logo.png'


function Nav({ setAddress }) {
    const { searchParams, updateSearchParams } = useSearch()
    // const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMobile = () => {
        console.log("test")
        document.getElementById('navbar').classList.toggle('is-active');
    }



    return (

        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <a className="navbar-item" href="https://www.alchemy.com">
                    <img src={logo} alt="alchemylogo" />
                </a>

                <button role="button" onClick={() => handleMobile()} className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </button>
            </div>

            <div id="navbar" className="navbar-menu">
                <div className="navbar-start">
                    <div className="navbar-item" >
                        <a href={"/"}>
                            Home
                        </a>
                    </div>
                </div>

                <div className="navbar-end">

                    <div className=" navbar-item is-flex ">

                       

                        {/* <Help type={searchParams.type} /> */}
                    </div>
                </div>
            </div>

        </nav >
    );





}

export default Nav;