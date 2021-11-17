import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, withRouter } from 'react-router-dom';
import './Navigation.scss';

var isClose = false;

const allowPath = { 1: '/', 2: '/key-generate', 3: '/get-address', 4: '/help', 5: '/network', 6: '/get-pub' };

class Navigation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rand: 0,
            isRedirect: false,
        }

        this.checkMaintain();
    }

    checkMaintain() {
        if (this.props.maintain.maintain) {

            var redirect = true;

            for (var path in allowPath) {
                if (this.props.location.pathname === allowPath[path]) {
                    redirect = false;
                    break;
                }
            }

            if (redirect) {
                this.props.history.push('/');
            }

        }

        setTimeout(() => this.checkMaintain(), 500);
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
            <div className="nav">
                {this.state.isRedirect ? <Redirect to="/" /> : false}
                {this.state.rand ? this.check() : false}
                <Link className="nav-title" to="/">
                    <p>MITUM WEB WALLET</p>
                </Link>
                <Link className={"nav-login " + (isLogin ? "on" : "off")}
                    to={this.props.maintain.maintain ? '/' : '/login'}>
                    <p>OPEN WALLET</p>
                </Link>
                {isLogin ? <p onClick={() => this.close()} id="nav-addr">{addr}</p> : false}
                {isLogin
                    ? (
                        <Link className="nav-sign" to='/sign'>
                            <p>SIGN OPERATION</p>
                        </Link>
                    ) : false}
                {isLogin && this.props.account.accountType === "single"
                    ? (
                        <Link className="nav-single-bulk" to="/bulk">
                            <p>SEND MULTI OPERATIONS</p>
                        </Link>
                    ) : false}
                {/* {isLogin && this.props.account.accountType === "multi"
                    ? (
                        <Link className="nav-multi-bulk" to="/bulk-menu">
                            <p>SIGN MULTI OPERATIONS</p>
                        </Link>
                    )
                    : false} */}
                {isLogin
                    ? (
                        <Link className="nav-res" to="/res-key-generate">
                            <p>SET RESTORE PASSWORD</p>
                        </Link>
                    ) : false}
                <Link className="main" to="/key-generate">
                    <p>GENERATE KEYPAIR</p>
                </Link>
                <Link className="main" to="/get-address">
                    <p>GET ADDRESS</p>
                </Link>
                <Link className="main" to="/get-pub">
                    <p>GET PUBLIC KEY</p>
                </Link>
                <Link className="main nav-help" to="/help">
                    <p>HELP</p>
                </Link>
                <Link className="setting" to="/network">
                    <p>SETTING</p>
                </Link>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,
    maintain: state.maintain
});

export default withRouter(connect(
    mapStateToProps,
)(Navigation));