import React from 'react';
import { Link } from 'react-router-dom';
import AniButton from './buttons/AniButton';
import './Navigation.scss';
import logo_circle from "../image/logo_circle.png";

function Navigation() {
    return (
        <div className="nav">
            <Link to="/">
                <div>
                    <img src={logo_circle} alt="logo circle" />
                </div>
            </Link>
            <span>
                <Link to="/login">
                    <AniButton disabled={false} onClick={() => { console.log("login") }} size="small">Open Wallet</AniButton>
                </Link>
                <Link to="/key-generate">
                    <AniButton disabled={false} onClick={() => { console.log("key-generate") }} size="small">Generate Key</AniButton>
                </Link>
                <Link to="/res-key-generate">
                    <AniButton disabled={true} onClick={() => { console.log("res-key-generate") }} size="small">Generate Restore Key</AniButton>
                </Link>
            </span>
        </div>
    )
}

export default Navigation;