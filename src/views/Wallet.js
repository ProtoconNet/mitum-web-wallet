import React, { createRef } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../store/actions';
import './Wallet.scss';

import copy from 'copy-to-clipboard';

import SelectButton from '../components/buttons/SelectButton';
import PublicKeyModal from '../components/modals/PublicKeyModal';

import * as mode from '../text/mode';
import { isAccountValid } from '../lib/Validation';

const balance = (bal) => {
    return (
        <li key={bal.currency}>
            <p className="currency">{bal.currency}</p>
            <p className="amount">{bal.amount}</p>
        </li>
    );
}

const history = (hist) => {
    return (
        <li key={hist.hash + hist.target} onClick={() => {
            copy(hist.hash);
            alert('fact hash copied');
        }}>
            <p id={hist.confirmation}>{hist.confirmation}</p>
            <p id={hist.direction}>{hist.direction}</p>
            <p id='confirmed-at'>{hist.confirmedAt}</p>
            <p id='target'>{hist.target}</p>
            <p id='currency'>{hist.currency}</p>
            <p id='amount'>{hist.amount}</p>
        </li>
    );
}

const titleStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    margin: '0',
    padding: '0'
}
const lineStyle = {
    width: '100%',
    border: '2px solid white',
    verticalAlign: 'middle',
}

const title = (content) => {
    return (
        <div style={titleStyle}>
            <div style={lineStyle}></div>
            <p style={{
                width: '100%',
                textAlign: 'center',
                verticalAlign: 'middle',
                fontWeight: '400',
                fontSize: '1.5em'
            }}>{content}</p>
            <div style={lineStyle}></div>
        </div>
    )
}

class Wallet extends React.Component {

    constructor(props) {
        super(props);

        this.walletRef = createRef();

        this.state = {
            restoreKey: undefined,

            isModalOpen: false,

            isRedirect: this.props.isLogin ? false : true,
            redirect: this.props.isLogin ? undefined : mode.PAGE_LOGIN,
            operation: undefined
        }
    }

    onMoreClick() {
        this.setState({
            isDetailVisible: !this.state.isDetailVisible
        });
    }

    onShowClick(target) {
        if (target === mode.SHOW_PRIVATE) {
            this.setState({
                isPrivVisible: !this.state.isPrivVisible
            })
        }
        else if (target === mode.SHOW_RESTORE) {
            this.setState({
                isResVisible: !this.state.isResVisible
            })
        }
        else {
            return;
        }
    }

    onSelect(oper) {
        if (oper === mode.OPER_CREATE_ACCOUNT
            || oper === mode.OPER_UPDATE_KEY
            || oper === mode.OPER_TRANSFER) {
            this.setState({
                isRedirect: true,
                redirect: mode.PAGE_OPER,
                operation: oper
            });
        }
    }

    renderRedirect() {
        if (!this.props.account || !isAccountValid(this.props.account)) {
            return <Redirect to="/login" />;
        }

        if (!this.state.isRedirect) {
            return false;
        }

        switch (this.state.redirect) {
            case mode.PAGE_OPER:
                return <Redirect to={{
                    pathname: '/operation',
                    state: {
                        operation: this.state.operation,
                    }
                }} />;
            case mode.PAGE_LOGIN:
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
            redirect: mode.PAGE_LOGIN
        })
    }

    closeModal() {
        this.setState({ isModalOpen: false });
    }

    openModal() {
        this.setState({ isModalOpen: true });
    }

    render() {
        return (
            <div className="wallet-container">
                {this.renderRedirect()}
                <span className="wallet-refresh" >
                    <p onClick={() => this.refresh()}>⟳</p>
                </span>
                <div className="wallet-ref" ref={this.walletRef}></div>
                <div className="wallet-info">
                    {title("ADDRESS" + (this.props.account.accountType === "multi" ? " - MULTI" : " - SINGLE"))}
                    <p id='address' onClick={() => this.openModal()}>{this.props.account.address}</p>
                    <section className="wallet-amount">
                        {title('BALANCE')}
                        <ul>
                            {this.props.account.balances ? this.props.account.balances.map(x => balance(x)) : false}
                        </ul>
                    </section>
                </div>
                <div className="wallet-operation">
                    <SelectButton size="wide" onClick={() => this.onSelect(mode.OPER_CREATE_ACCOUNT)}>CREATE ACCOUNT</SelectButton>
                    <SelectButton size="wide" onClick={() => this.onSelect(mode.OPER_UPDATE_KEY)}>UPDATE KEY</SelectButton>
                    <SelectButton size="wide" onClick={() => this.onSelect(mode.OPER_TRANSFER)}>TRANSFER</SelectButton>
                </div>
                <div className="wallet-history">
                    {title('HISTORY')}
                    <ul>
                        {this.props.history.map(x => history(x))}
                    </ul>
                </div>
                <PublicKeyModal onClose={() => this.closeModal()} isOpen={this.state.isModalOpen} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,
    history: state.login.history
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, privateKey, data) => dispatch(login(address, privateKey, data)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Wallet));