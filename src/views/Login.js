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

const getAccountInformation = async (account) => {
    return await axios.get(process.env.REACT_APP_API_ACCOUNT + account);
}

const getAccountHistory = async (account) => {
    return await axios.get(`${process.env.REACT_APP_API_ACCOUNT}${account}/operations`);
}

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: SHOW_PRIVATE,
            isPriv: true,
            isActive: false
        }
    }

    onLogin(addr, priv) {
        let pubKey;

        try {
            pubKey = toKeypair(priv, '').getPublicKey();
        } catch (e) {
            alert('지갑 열기 실패! :(\n유효하지 않은 비밀키입니다.');
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
                            this.props.signIn(addr, priv, res.data);
                            return;
                        }
                    }
                    alert(`지갑 열기 실패! :(\n계정 [${addr}]의 멤버에 해당 키가 존재하지 않습니다.`);
                }
            )
            .catch(
                e => {
                    console.log(e);
                    alert(`지갑 열기 실패! :(\n계정 조회에 실패하였습니다. 잠시 후 다시 시도해보세요.`);
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
    signIn: (address, privateKey, data) => dispatch(login(address, privateKey, data)),
    setHistory: (data, me) => dispatch(setHistory(data, me)),
    clearHistory: () => dispatch(clearHistory())
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(Login));