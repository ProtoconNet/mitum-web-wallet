import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import './SubNavigation.scss';

var isClose = false;

class SubNavigation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rand: 0
        }
    }

    close() {
        isClose = true;
        this.setState({ rand: this.state.rand + 1 })
    }

    check() {
        if (isClose) {
            isClose = false;
            return <Redirect to="/logout" />
        }
        else {
            return false;
        }
    }

    render() {
        const { isLogin, account } = this.props;
        const addr = account ? account.address.substring(0, 10) + "... (close wallet)" : undefined;

        return (
            <div className="sub-nav">
                {this.state.rand ? this.check() : false}
                <input className='burger-check' id="burger-check" type="checkbox"/>
                <label className="burger-icon" for="burger-check">
                    <span className="burger-sticks"></span>
                </label>
                <Link className="sub-nav-title" to="/">
                    <p>MITUM WEB WALLET</p>
                </Link>
                <div className='sub-nav-menu'>
                    <div className='menu'>
                        <Link className={"nav-login " + (isLogin ? "on" : "off")} to="/login">
                            <p>OPEN WALLET</p>
                        </Link>
                        {isLogin
                            ? (
                                <Link className="nav-sign" to='/sign'>
                                    <p>SIGN OPERATION</p>
                                </Link>
                            ) : false}
                        <Link className="main" to="/key-generate">
                            <p>GENERATE KEYPAIR</p>
                        </Link>
                        {account && account.restoreKey
                            ? (
                                <Link className="main" to="/res-key-generate">
                                    <p>GENERATE RESTORE KEY</p>
                                </Link>
                            ) : false}
                        <Link className="main nav-help" to="/help">
                            <p>HELP</p>
                        </Link>
                        {isLogin ? <p onClick={() => this.close()} id="nav-addr">{addr}</p> : false}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account
});

export default connect(
    mapStateToProps,
)(SubNavigation);