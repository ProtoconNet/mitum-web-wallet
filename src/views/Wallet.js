import React from 'react';
import { Redirect } from 'react-router-dom';
import './Wallet.scss';

import copy from 'copy-to-clipboard';

import SelectButton from '../components/buttons/SelectButton';
import { connect } from 'react-redux';
import { login } from '../store/actions';

const PATH_LOGIN = 'path-login';
const PATH_SIGN = 'path-sign';
const PATH_OPER = 'path-operation';

const OPER_CREATE_ACCOUNT = 'oper-create-account';
const OPER_UPDATE_KEY = 'oper-update-key';
const OPER_TRANSFER = 'oper-transfer';

const SHOW_PRIVATE='show-private';
const SHOW_RESTORE='show-restore';

const onCopy = (msg) => {
    copy(msg);
    alert("copied!");
}

const balance = (bal) => {
    return (
        <div key={bal.currency}>
            <p>{bal.currency}</p>
            <p>{bal.amount}</p>
        </div>
    );
}

const publicKey = (key) => {
    return (
        <div key={key.key}
            onClick={() => onCopy(key.key)}>
            <p>{key.key}</p>
        </div>
    )
}

const key = (key) => {
    if(!key) {
        return false;
    }
    return (
        <div onClick={() => onCopy(key)}>
            {key}
        </div>
    );
}

class Wallet extends React.Component {
 
    constructor(props){
        super(props);

        this.state = { 
            restoreKey: undefined,

            isDetailVisible: false,
            isPrivVisible: false,
            isResVisible: false,
            
            isRedirect: this.props.isLogin ? false : true,
            redirect: this.props.isLogin ? undefined : PATH_LOGIN,
            operation: undefined
        }
    }

    onMoreClick() {
        this.setState({
            isDetailVisible: !this.state.isDetailVisible
        });
    }

    onShowClick(target) {
        if(target === SHOW_PRIVATE){
            this.setState({
                isPrivVisible: !this.state.isPrivVisible
            })
        }
        else if(target === SHOW_RESTORE){
            this.setState({
                isResVisible: !this.state.isResVisible
            })
        }
        else{
            return;
        }
    }

    onSelect(oper) {
        if(oper === PATH_SIGN){
            this.setState({
                isRedirect: true,
                redirect: PATH_SIGN
            })
        }
        else{
            this.setState({
                isRedirect: true,
                redirect: PATH_OPER,
                operation: oper
            });
        }
    }

    renderRedirect() {
        if(!this.state.isRedirect) {
            return false;
        }

        switch(this.state.redirect) {
            case PATH_OPER: 
                return <Redirect to={{
                            pathname: '/operation',
                            state: {
                                operation: this.state.operation,
                            }
                        }}/>;
            case PATH_SIGN:
                return <Redirect to={{
                            pathname: '/sign',
                            state: {
                                json: undefined
                            }
                        }} />
            case PATH_LOGIN:
                return <Redirect to='/login'/>
            default: return false;
        }
    }

    render() {
        const account = this.props.account;
        return(
            <div className="wallet-container">
                { this.renderRedirect() }
                <div className="wallet-info">
                    <span className="wallet-info-account">
                        <h2>{ "ACCOUNT" + ( account.accountType === "multi" ? " - MUL" : " - SIN")}</h2>
                        <p onClick={() => onCopy(account.address)}>{account.address}</p>
                    </span>
                    <span className="wallet-info-detail">
                        <span className="wallet-amount">
                            <h2>BALANCE</h2>
                            { account.balances ? account.balances.map(x => balance(x)) : false }
                        </span>
                        <span className="wallet-more"
                            onClick={() => this.onMoreClick()}>
                            <section>
                                <p>MORE </p>
                                <p className="more-down" style={{ display: this.state.isDetailVisible ? "none" : "inherit"}}>▽</p>
                                <p className="more-up" style={{ display: this.state.isDetailVisible ? "inherit" : "none" }}>△</p>
                            </section>
                        </span>
                        <span className="wallet-more-detail"
                            style={{display: this.state.isDetailVisible ? "inherit" : "none"}}>
                            <div>
                                <div className="wallet-pub-key">
                                    <h2>PUBLIC KEY</h2>
                                    { account.publicKeys ? account.publicKeys.map(x => publicKey(x)) : false }
                                </div>
                                <div className="wallet-priv-key">
                                    <h2>PRIVATE KEY</h2>
                                    { this.state.isPrivVisible ? key(account.privateKey) : false }
                                    <span onClick={() => this.onShowClick(SHOW_PRIVATE)}>
                                        { this.state.isPrivVisible ? "- HIDE -" : "! SHOW !" }
                                    </span>
                                </div>
                                <div className="wallet-res-key">
                                    <h2>RESTORE KEY</h2>
                                    { this.state.isResVisible ? key(account.restoreKey) : false }
                                    <span onClick={() => this.onShowClick(SHOW_RESTORE)}>
                                        { this.state.isResVisible ? "- HIDE -" : "! SHOW !" }
                                    </span> 
                                </div>
                            </div>
                        </span>
                    </span>
                    <p className="wallet-copy-help">CLICK EACH KEY TO COPY...</p>
                </div>
                <div className="wallet-operation">
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_CREATE_ACCOUNT)}>CREATE ACCOUNT</SelectButton>
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_UPDATE_KEY)}>UPDATE KEY</SelectButton>
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_TRANSFER)}>TRANSFER</SelectButton>
                </div>
                <div className="wallet-sign">
                    <SelectButton onClick={() => this.onSelect(PATH_SIGN)} size="wide">
                        Sign or Send
                    </SelectButton>
                </div>
            </div>
        );
    }s
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, privateKey, data) => dispatch(login({address, privateKey, data})),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Wallet);