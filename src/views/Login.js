import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import axios from 'axios';
import './Login.scss';

import PrivateKeyLoginBox from '../components/PrivateKeyLoginBox';
import RestoreKeyLoginBox from '../components/RestoreKeyLoginBox';

import { clearHistory, login, setHistory } from '../store/actions';
import { connect } from 'react-redux';

import { toKeypair } from 'mitumc';
import { SHOW_PRIVATE, SHOW_RESTORE } from '../text/mode';
import { isAddressValid, isPrivateKeyValid } from '../lib/Validation';
import AlertModal from '../components/modals/AlertModal';

const getAccountInformation = async (account) => {
    return await axios.get(process.env.REACT_APP_API_ACCOUNT + account);
}

const getAccountHistory = async (account) => {
    return await axios.get(`${process.env.REACT_APP_API_ACCOUNT}${account}/operations?reverse=1`);
}

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: SHOW_PRIVATE,
            isPriv: true,
            isActive: false,

            isAlertShow: false,
            alertTitle: '',
            alertMsg: ''
        }
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
        })
    }

    onLogin(addr, priv) {
        if(!isAddressValid(addr) || !isPrivateKeyValid(priv)) {
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

        getAccountHistory(addr)
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

        getAccountInformation(addr)
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
                    onLogin={(addr, priv) => this.onLogin(addr, priv)} />;
            case SHOW_RESTORE:
                return <RestoreKeyLoginBox />;
            default:
                return <PrivateKeyLoginBox
                    onLogin={(addr, priv) => this.onLogin(addr, priv)} />;
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

    render() {
        if (this.props.isLogin) {
            this.onLogin(this.props.account.address, this.props.account.privateKey);
        }

        return (
            <div className="login-container">
                <h1>OPEN WALLET</h1>
                {this.props.isLoadHistory && this.props.isLogin ? <Redirect to={`/wallet/${this.props.account.address}`} /> : false}
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
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,
    history: state.login.history,
    isLoadHistory: state.login.isLoadHistory
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, privateKey, publicKey, data) => dispatch(login(address, privateKey, publicKey, data)),
    setHistory: (data, me) => dispatch(setHistory(data, me)),
    clearHistory: () => dispatch(clearHistory())
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login));