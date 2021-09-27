import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import './SubNavigation.scss';

var isClose = false;

class SubNavigation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rand: 0,
            isChecked: false
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

    onCheckOut() {
        this.setState({
            isChecked: false
        });
    }

    onCheck() {
        this.setState({
            isChecked: !this.state.isChecked
        })
    }

    render() {
        const { isLogin, account } = this.props;
        const addr = account ? account.address.substring(0, 20) + "... (close wallet)" : undefined;

        return (
            <div className="sub-nav">
                {this.state.rand ? this.check() : false}
                <input className='burger-check' id="burger-check" type="checkbox" checked={this.state.isChecked} />
                <label className="burger-icon" htmlFor="burger-check"
                    onClick={() => this.onCheck()}>
                    <span className="burger-sticks"></span>
                </label>
                <Link className="sub-nav-title" to="/"
                    onClick={() => this.onCheckOut()}>
                    <p>MITUM WEB WALLET</p>
                </Link>
                <div className='sub-nav-menu'>
                    <div className='menu'>
                        <Link className={"nav-login " + (isLogin ? "on" : "off")} to="/login"
                            onClick={() => this.onCheckOut()}>
                            <p>OPEN WALLET</p>
                        </Link>
                        {isLogin
                            ? (
                                <Link className={"nav-login " + (isLogin ? "on" : "off")} to='/sign'
                                    onClick={() => this.onCheckOut()}>
                                    <p>SIGN OPERATION</p>
                                </Link>
                            ) : false}
                        <Link className="main" to="/key-generate"
                            onClick={() => this.onCheckOut()}>
                            <p>GENERATE KEYPAIR</p>
                        </Link>
                        <Link className="main" to="/get-address"
                            onClick={() => this.onCheckOut()}>
                            <p>GET ADDRESS</p>
                        </Link>
                        {account && account.restoreKey
                            ? (
                                <Link className="main" to="/res-key-generate"
                                    onClick={() => this.onCheckOut()}>
                                    <p>GENERATE RESTORE KEY</p>
                                </Link>
                            ) : false}
                        <Link className="main" to="/help"
                            onClick={() => this.onCheckOut()}>
                            <p>HELP</p>
                        </Link>
                        <Link className="main" to="/network"
                            onClick={() => this.onCheckOut()}>
                            <p>SETTING</p>
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