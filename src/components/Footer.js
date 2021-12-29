import React from 'react';
import './Footer.scss';

function Footer() {
    return (
        <div className="footer-container">
            <p>{`MITUM VERSION ${process.env.REACT_APP_VERSION}`}</p>
            <a href="https://github.com/ProtoconNet/mitum-web-wallet">https://github.com/ProtoconNet/mitum-web-wallet</a>
        </div>
    );
}

export default Footer;