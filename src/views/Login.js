import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import axios from 'axios';
import './Login.scss';

import PrivateKeyLoginBox from '../components/PrivateKeyLoginBox';
import RestoreKeyLoginBox from '../components/RestoreKeyLoginBox';

import { clearHistory, login, setHistory, setKeypair } from '../store/actions';
import { connect } from 'react-redux';

import { toKeypair } from 'mitumc';
import { SHOW_PRIVATE, SHOW_RESTORE } from '../text/mode';
import { isAddressValid, isPrivateKeyValid } from '../lib/Validation';
import AlertModal from '../components/modals/AlertModal';

class Login extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.isLogin) {
            this.onLogin(this.props.account.address, this.props.account.privateKey);
        }

        this.state = {
            mode: SHOW_PRIVATE,
            isPriv: true,
            isActive: false,

            isAlertShow: false,
            alertTitle: '',
            alertMsg: '',

            isShowLoad: false,
            isRedirect: false,

            tryLogin: false,

            initiate: false,
        }
    }

    async getAccountInformation(account) {
        return await axios.get(this.props.networkAccount + account);
    }

    async getAccountHistory(account) {
        return await axios.get(`${this.props.networkAccount}${account}/operations?reverse=1`);
    }

    openAlert(title, msg) {
        this.setState({
            isAlertShow: true,
            alertTitle: title,
            alertMsg: msg
        });
    }

    closeAlert() {
        this.setState({
            isAlertShow: false
        });
    }

    onLogin(_addr, _priv) {
        const addr = _addr.trim();
        const priv = _priv.trim();

        if (!isAddressValid(addr) || !isPrivateKeyValid(priv)) {
            this.openAlert('지갑 열기 실패 :(', '주소 혹은 키 형식이 올바르지 않습니다.');
            return;
        }

        let pubKey;
        try {
            pubKey = toKeypair(priv, '').getPublicKey();
        } catch (e) {
            this.openAlert('지갑 열기 실패 :(', '유효하지 않은 개인키입니다.');
            return;
        }

        this.getAccountHistory(addr)
            .then(
                res => {
                    this.props.setHistory(res.data, addr);
                }
            )
            .catch(
                e => {
                    this.props.setHistory(null, addr);
                }
            )

        this.getAccountInformation(addr)
            .then(
                res => {
                    const pubKeys = res.data._embedded.keys.keys.map(x => x.key);
                    for (let i = 0; i < pubKeys.length; i++) {
                        if (pubKeys[i] === pubKey) {
                            this.props.signIn(addr, priv, pubKey, res.data);
                            return;
                        }
                    }
                    this.openAlert('지갑 열기 실패 :(', `계정 [${addr}]의 멤버에 해당 키가 존재하지 않습니다.`);
                }
            )
            .catch(
                e => {
                    console.log(e);
                    this.openAlert('지갑 열기 실패 :(', '유효하지 않은 주소 혹은 네트워크 문제로 계정 조회에 실패하였습니다.');
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
            case SHOW_PRIVATE:
                return <PrivateKeyLoginBox
                    onLogin={(addr, priv) => this.onStartLogin(addr, priv)} />;
            case SHOW_RESTORE:
                return <RestoreKeyLoginBox />;
            default:
                return <PrivateKeyLoginBox
                    onLogin={(addr, priv) => this.onStartLogin(addr, priv)} />;
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

    async onStartLogin(addr, priv) {
        const pubKey = toKeypair(priv, '').getPublicKey();
        this.props.setKeypair(priv, pubKey);

        this.setState({
            initiate: true,
        })
    }

    render() {

        if (this.props.isLogin && this.props.isLoadHistory) {
            return <Redirect to={`/wallet/${this.props.account.address}`} />
        }

        if(this.state.initiate) {
            return <Redirect to="/init" />
        }

        return (
            <div className="login-container">
                <div id='login-main'
                    style={{
                        display: this.state.isShowLoad ? 'none' : 'flex'
                    }}>
                    <h1>OPEN WALLET</h1>
                    <div className="login-radio" style={this.state.isActive ? {} : { display: "none" }}>
                        <label className="rad-label">
                            <input type="radio" className="rad-input" value={SHOW_PRIVATE} name="rad"
                                onChange={() => this.onChange()} onClick={() => this.onClick()} checked={this.state.isPriv} />
                            <div className="rad-design"></div>
                            <div className="rad-text">Private Key</div>
                        </label>

                        <label className="rad-label">
                            <input type="radio" className="rad-input" value={SHOW_RESTORE} name="rad"
                                onChange={() => this.onChange()} onClick={() => this.onClick()} checked={!this.state.isPriv} />
                            <div className="rad-design"></div>
                            <div className="rad-text">Restore Key</div>
                        </label>
                    </div>
                    <AlertModal isOpen={this.state.isAlertShow} onClose={() => this.closeAlert()}
                        title={this.state.alertTitle} msg={this.state.alertMsg} />
                    {this.renderForm()}
                </div>
                <div id='login-load'
                    style={{
                        display: this.state.isShowLoad ? 'flex' : 'none'
                    }}>
                    <h1>Wait...</h1>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,
    history: state.login.history,
    isLoadHistory: state.login.isLoadHistory,
    networkAccount: state.network.networkAccount,
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, privateKey, publicKey, data) => dispatch(login(address, privateKey, publicKey, data)),
    setKeypair: (priv, pub) => dispatch(setKeypair(priv, pub)),
    setHistory: (data, me) => dispatch(setHistory(data, me)),
    clearHistory: () => dispatch(clearHistory())
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login));