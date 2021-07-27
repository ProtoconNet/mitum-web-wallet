import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import axios from 'axios';
import './Login.scss';

import PrivateKeyLoginBox from '../components/PrivateKeyLoginBox';
import RestoreKeyLoginBox from '../components/RestoreKeyLoginBox';

import { login } from '../store/actions';
import { connect } from 'react-redux';

import { toKeypair } from 'mitumc';

const MODE_PRIV_KEY = 'MODE_PRIV_KEY';
const MODE_RES_KEY = 'MODE_RES_KEY';

const getAccountInformation = async (account) => {
    try {
        return await axios.get(process.env.REACT_APP_API_ACCOUNT + account);
    } catch (e) {
        alert(`Could not sign in\n${account}`);
    }
}


class Login extends React.Component {
    constructor(props) {
        super(props);

        this.renderForm = this.renderForm.bind(this);
        this.reloadAccount = this.reloadAccount.bind(this);

        this.state = {
            mode: MODE_PRIV_KEY,
            isPriv: true,
            isActive: false,
        }
    }

    onLogin(addr, priv) {
        let pubKey;

        try {
            pubKey = toKeypair(priv, '').getPublicKey();
        } catch (e) {
            alert('Invalid private key');
            return;
        }

        getAccountInformation(addr)
            .then(
                res => {
                    const pubKeys = res.data._embedded.keys.keys.map(x => x.key);
                    for (let i = 0; i < pubKeys.length; i++) {
                        if (pubKeys[i] === pubKey) {
                            this.props.signIn(addr, priv, res.data);
                            return;
                        }
                    }
                    alert(`Could not sign in\naccount: ${addr}`);
                }
            )
            .catch(
                e => {
                    console.log(e);
                    alert(`Could not sign in\naccount: ${addr}`);
                }
            );
    }

    onChange() {
        const radio = document.querySelector("input[type=radio]:checked").value;

        if (this.state.isActive) {
            this.setState({
                mode: radio
            });
        }
        else return;
    }

    renderForm() {
        const { mode } = this.state;
        switch (mode) {
            case MODE_PRIV_KEY:
                return <PrivateKeyLoginBox onLogin={(addr, priv) => this.onLogin(addr, priv)} />
            case MODE_RES_KEY:
                return <RestoreKeyLoginBox />;
            default:
                return <PrivateKeyLoginBox onLogin={(addr, priv) => this.onLogin(addr, priv)} />;
        }
    }

    onClick() {
        if (this.state.isActive) {
            this.setState({
                isPriv: !this.state.isPriv
            });
        }
        else return;
    }

    reloadAccount() {
        this.onLogin(this.props.account.address, this.props.account.privateKey);
    }

    render() {
        if (this.props.isLogin) {
            this.reloadAccount();
        }

        return (
            <div className="login-container">
                <h1>OPEN WALLET</h1>
                {this.props.isLogin ? <Redirect to={`/wallet/${this.props.account.address}`} /> : false}
                <div className="login-radio" style={this.state.isActive ? {} : { display: "none" }}>
                    <label className="rad-label">
                        <input type="radio" className="rad-input" value={MODE_PRIV_KEY} name="rad"
                            onChange={() => this.onChange()} onClick={() => this.onClick()} checked={this.state.isPriv} />
                        <div className="rad-design"></div>
                        <div className="rad-text">Private Key</div>
                    </label>

                    <label className="rad-label">
                        <input type="radio" className="rad-input" value={MODE_RES_KEY} name="rad"
                            onChange={() => this.onChange()} onClick={() => this.onClick()} checked={!this.state.isPriv} />
                        <div className="rad-design"></div>
                        <div className="rad-text">Restore Key</div>
                    </label>
                </div>
                {this.renderForm()}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, privateKey, data) => dispatch(login(address, privateKey, data)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login));