import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import axios from 'axios';
import './Login.scss';

import PrivateKeyLoginBox from '../components/PrivateKeyLoginBox';
import RestoreKeyLoginBox from '../components/RestoreKeyLoginBox';

import { allowLogin, clearHistory, login, logout, rejectLogin, setHistory, setKeypair } from '../store/actions';
import { connect } from 'react-redux';

import { toKeypair } from 'mitumc';
import { SHOW_PRIVATE, SHOW_RESTORE } from '../text/mode';
import { isPrivateKeyValid } from '../lib/Validation';
import AlertModal from '../components/modals/AlertModal';

class Login extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.isLogin) {
            this.onLogin(this.props.account.privateKey);
        }

        this.state = {
            mode: this.props.isRestoreKeyExist ? SHOW_RESTORE : SHOW_PRIVATE,
            isPriv: this.props.isRestoreKeyExist ? false : true,
            isActive: true,

            isAlertShow: false,
            alertTitle: '',
            alertMsg: '',

            isShowLoad: this.props.isLogin,
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

    onLogin(_priv) {
        const addr = this.props.account.address;
        const priv = _priv.trim();

        if (!isPrivateKeyValid(priv)) {
            this.openAlert('지갑 열기 실패 :(', '키 형식이 올바르지 않습니다.');
            this.props.rejectLogin();
            return;
        }

        let pubKey;
        try {
            pubKey = toKeypair(priv, '').getPublicKey();
        } catch (e) {
            this.openAlert('지갑 열기 실패 :(', '유효하지 않은 개인키입니다.');
            this.props.rejectLogin();
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
                    if(this.props.isLoginAllowed) {
                        this.props.signIn(addr, priv, pubKey, res.data);
                    }
                }
            )
            .catch(
                e => {
                    this.openAlert('지갑 열기 실패 :(', '잘못된 계정 주소 혹은 네트워크 문제로 계정 조회에 실패하였습니다.');
                    this.props.rejectLogin();
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
                    onLogin={(priv) => this.onStartLogin(priv)} />;
            case SHOW_RESTORE:
                return <RestoreKeyLoginBox 
                    onLogin={(priv) => this.onStartLogin(priv)}/>;
            default:
                return <PrivateKeyLoginBox
                    onLogin={(priv) => this.onStartLogin(priv)} />;
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

    async onStartLogin(priv) {
        this.props.allowLogin();
        try {
            const pubKey = toKeypair(priv, '').getPublicKey();
            this.props.setKeypair(priv, pubKey);
        }
        catch(e) {
            this.openAlert("지갑 열기 실패! :(", '유효하지 않은 개인키입니다.');
            this.props.rejectLogin();
        }

        this.setState({
            initiate: true,
        })
    }

    componentDidMount() {
        if (!this.props.isLogin && this.props.priv.length > 0 && this.props.pub.length > 0) {
            this.openAlert("지갑 열기 실패! :(", "네트워크 혹은 잘못된 키 문제로 지갑 열기에 실패하였습니다.");
            this.props.rejectLogin();
            this.props.signOut();
        }
    }

    render() {

        if (this.props.isLogin && this.props.isLoadHistory) {
            return <Redirect to={`/wallet/${this.props.account.address}`} />
        }

        if (this.state.initiate) {
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
                    <h1>Now Loading...</h1>
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
    priv: state.login.priv,
    pub: state.login.pub,

    isRestoreKeyExist: state.restore.isSet,
    isLoginAllowed: state.allow.isLoginAllowed,
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, privateKey, publicKey, data) => dispatch(login(address, privateKey, publicKey, data)),
    signOut: () => dispatch(logout()),
    allowLogin: () => dispatch(allowLogin()),
    rejectLogin: () => dispatch(rejectLogin()),
    setKeypair: (priv, pub) => dispatch(setKeypair(priv, pub)),
    setHistory: (data, me) => dispatch(setHistory(data, me)),
    clearHistory: () => dispatch(clearHistory())
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login));