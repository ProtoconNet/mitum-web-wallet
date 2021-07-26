import React, { createRef } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import './Wallet.scss';

import copy from 'copy-to-clipboard';

import SelectButton from '../components/buttons/SelectButton';
import { connect } from 'react-redux';
import { login } from '../store/actions';

const PATH_LOGIN = 'path-login';
// const PATH_SIGN = 'path-sign';
const PATH_OPER = 'path-operation';

const OPER_CREATE_ACCOUNT = 'oper-create-account';
const OPER_UPDATE_KEY = 'oper-update-key';
const OPER_TRANSFER = 'oper-transfer';

const SHOW_PRIVATE = 'show-private';
const SHOW_RESTORE = 'show-restore';

const onCopy = (msg) => {
    copy(msg);
    alert("copied!");
}

const balance = (bal) => {
    return (
        <li key={bal.currency}>
            <span className="currency">{bal.currency}</span>
            <span className="amount">{bal.amount}</span>
        </li>
    );
}

const publicKey = (key) => {
    return (
        <li key={key.key}
            onClick={() => onCopy(key.key)}>
            {key.key}
        </li>
    )
}

const key = (key) => {
    if (!key) {
        return false;
    }
    return (
        <p onClick={() => onCopy(key)}>
            {key}
        </p>
    );
}

class Wallet extends React.Component {

    constructor(props) {
        super(props);

        this.walletRef = createRef();

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
        if (target === SHOW_PRIVATE) {
            this.setState({
                isPrivVisible: !this.state.isPrivVisible
            })
        }
        else if (target === SHOW_RESTORE) {
            this.setState({
                isResVisible: !this.state.isResVisible
            })
        }
        else {
            return;
        }
    }

    onSelect(oper) {
        if (oper === OPER_CREATE_ACCOUNT 
                || oper === OPER_UPDATE_KEY
                || oper === OPER_TRANSFER) {
            this.setState({
                isRedirect: true,
                redirect: PATH_OPER,
                operation: oper
            });
        }
    }

    renderRedirect() {
        if (!this.props.account || !this.props.account.accountType
            || !this.props.account.publicKeys || !this.props.account.balances
            || !this.props.account.privateKey) {
            return <Redirect to="/login" />;
        }

        if (!this.state.isRedirect) {
            return false;
        }

        switch (this.state.redirect) {
            case PATH_OPER:
                return <Redirect to={{
                    pathname: '/operation',
                    state: {
                        operation: this.state.operation,
                    }
                }} />;
            case PATH_LOGIN:
                return <Redirect to='/login' />
            default: return false;
        }
    }

    componentDidMount() {
        this.scrollToAccount();
    }

    componentDidUpdate() {
        this.scrollToAccount();
    }

    scrollToAccount = () => {
        if (this.walletRef.current) {
            this.walletRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    refresh() {
        this.setState({
            isRedirect: true,
            redirect: PATH_LOGIN
        })
    }

    render() {
        return (
            <div className="wallet-container">
                {this.renderRedirect()}
                <span className="wallet-refresh" >
                    <p onClick={() => this.refresh()}>
                        ⟳
                    </p>
                </span>
                <div className="wallet-ref" ref={this.walletRef}></div>
                <h1>ACCOUNT INFO</h1>
                <div className="wallet-info">
                    {this.state.isDetailVisible
                        ? false
                        : (
                            <span className="wallet-info-account">
                                <h2>{"ADDRESS" + (this.props.account.accountType === "multi" ? " - MULTI" : " - SINGLE")}</h2>
                                <p onClick={() => onCopy(this.props.account.address)}>{this.props.account.address}</p>
                            </span>
                        )
                    }
                    <span className="wallet-info-detail">
                        {this.state.isDetailVisible
                            ? (
                                <span className="wallet-more-detail"
                                    style={{ display: this.state.isDetailVisible ? "inherit" : "none" }}>
                                    <div>
                                        <div className="wallet-pub-key">
                                            <h2>PUBLIC KEY</h2>
                                            <ul>
                                                {this.props.account.publicKeys ? this.props.account.publicKeys.map(x => publicKey(x)) : false}
                                            </ul>
                                        </div>
                                        <div className="wallet-priv-key">
                                            <h2>PRIVATE KEY</h2>
                                            {this.state.isPrivVisible ? key(this.props.account.privateKey) : false}
                                            <label onClick={() => this.onShowClick(SHOW_PRIVATE)}>
                                                {this.state.isPrivVisible ? "- HIDE -" : "! SHOW !"}
                                            </label>
                                        </div>
                                        {this.props.account && this.props.account.restoreKey
                                            ? (
                                                <div className="wallet-res-key">
                                                    <h2>RESTORE KEY</h2>
                                                    {this.state.isResVisible ? key(this.props.account.restoreKey) : false}
                                                    <label onClick={() => this.onShowClick(SHOW_RESTORE)}>
                                                        {this.state.isResVisible ? "- HIDE -" : "! SHOW !"}
                                                    </label>
                                                </div>
                                            )
                                            : false
                                        }
                                    </div>
                                </span>
                            )
                            : (
                                <span className="wallet-amount">
                                    <h2>BALANCE</h2>
                                    <ul>
                                        {this.props.account.balances ? this.props.account.balances.map(x => balance(x)) : false}
                                    </ul>
                                </span>
                            )
                        }
                        <span className="wallet-more"
                            onClick={() => this.onMoreClick()}>
                            <section>
                                <p>{this.state.isDetailVisible ? "BACK" : "MORE"}</p>
                            </section>
                        </span>
                    </span>
                </div>
                <div className="wallet-operation">
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_CREATE_ACCOUNT)}>CREATE ACCOUNT</SelectButton>
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_UPDATE_KEY)}>UPDATE KEY</SelectButton>
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_TRANSFER)}>TRANSFER</SelectButton>
                </div>
            </div>
        );
    } s
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, privateKey, data) => dispatch(login({ address, privateKey, data })),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Wallet));