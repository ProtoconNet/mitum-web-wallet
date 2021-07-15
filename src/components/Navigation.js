import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './Navigation.scss';

function Navigation({isLogin}) {
    return (
        <div className="nav">
            <Link className="side nav-title" to="/">
                <p>MITUM WEB WALLET</p>
            </Link>
            <Link className="main" to="/login">
                <p>OPEN WALLET</p>
            </Link>
            <Link className="main" to="/key-generate">
                <p>GENERATE KEYPAIR</p>
            </Link>
            <Link className="main" to="/res-key-generate">
                <p>GENERATE RESTORE KEY</p>
            </Link>
            {isLogin
                ? (
                    <Link className="side nav-logout" to="/logout">
                        <p>SIGN OUT</p>
                    </Link>
                ) : false}
            <Link className="side nav-help" to="/help">
                <p>HELP</p>
            </Link>
        </div>
    )
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
});

export default connect(
    mapStateToProps,
)(Navigation);