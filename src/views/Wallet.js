import React, { createRef } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { dequeueOperation, login } from '../store/actions';
import './Wallet.scss';

import copy from 'copy-to-clipboard';

import SelectButton from '../components/buttons/SelectButton';
import PublicKeyModal from '../components/modals/PublicKeyModal';
import PendingModal from '../components/modals/PendingModal';
import axios from 'axios';

import { isAccountValid } from '../lib/Validation';

import Sleep from '../lib/Sleep';
import { OPER_CREATE_ACCOUNT, OPER_TRANSFER, OPER_UPDATE_KEY, PAGE_LOGIN, PAGE_OPER, SHOW_PRIVATE, SHOW_RESTORE } from '../text/mode';

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
            alert('fact hash copied!');
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

const title = (content) => {
    return (
        <div id='container' style={titleStyle}>
            <div id='line'></div>
            <p id='body'>{content}</p>
            <div id='line'></div>
        </div>
    )
}

const getFactInState = async (hash) => {
    return await axios.get(process.env.REACT_APP_API_SEARCH_FACT + hash);
}

class Wallet extends React.Component {

    constructor(props) {
        super(props);

        this.walletRef = createRef();

        this.state = {
            restoreKey: undefined,

            isPubModalOpen: false,
            isPendModalOpen: false,
            isQueueUpdate: 1,

            isRedirect: this.props.isLogin ? false : true,
            redirect: this.props.isLogin ? undefined : PAGE_LOGIN,
            operation: undefined
        }
    }

    async checkInState() {
        while (!this.props.queue.isEmpty()) {
            const target = this.props.queue.target;

            if (!target) {
                break;
            }

            var isResult = false;
            getFactInState(target.hash)
                .then(
                    res => {
                        if (res.request.status === 200) {
                            this.props.deleteJob();
                            this.setState({ isQueueUpdate: this.state.isQueueUpdate + 1 });
                        }
                    }
                )
                .catch(
                    e => {
                        console.log(e);
                    }
                )
                .finally(() => {
                    isResult = true;
                });

            while (!isResult) {
                await Sleep(500);
            }
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
                redirect: PAGE_OPER,
                operation: oper
            });
        }
    }

    componentDidMount() {
        this.scrollToAccount();
        this.checkInState();

        setTimeout(() => {
            this.refresh();
        }, 5000);
    }

    componentDidUpdate() {
        this.scrollToAccount();
    }

    scrollToAccount = () => {
        if (this.walletRef.current) {
            this.walletRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    closePubModal() {
        this.setState({ isPubModalOpen: false });
    }

    openPubModal() {
        this.setState({ isPubModalOpen: true });
    }

    closePendModal() {
        this.setState({ isPendModalOpen: false });
    }

    openPendModal() {
        this.setState({ isPendModalOpen: true });
    }

    refresh() {
        this.setState({
            isRedirect: true,
            redirect: PAGE_LOGIN
        });
    }

    render() {
        
        if (!this.props.account || !isAccountValid(this.props.account)) {
            return <Redirect to="/login" />;
        }

        if (this.state.isRedirect) {
            if (this.state.redirect === PAGE_OPER) {
                return <Redirect to={{
                    pathname: '/operation',
                    state: {
                        operation: this.state.operation,
                    }
                }} />;
            }
            else if (this.state.redirect === PAGE_LOGIN) {
                return <Redirect to='/login' />;
            }
        }

        return (
            <div className="wallet-container" >
                <div className="wallet-ref" ref={this.walletRef} ></div>
                <div id='wallet-refresh'><p onClick={() => this.refresh()}>↻</p></div>
                <div className="wallet-info">
                    {title("ADDRESS" + (this.props.account.accountType === "multi" ? " - MULTI" : " - SINGLE"))}
                    <p id='address' onClick={() => this.openPubModal()}>{this.props.account.address}</p>
                    <section className="wallet-amount">
                        {title('BALANCE')}
                        <ul>
                            {this.props.account.balances ? this.props.account.balances.map(x => balance(x)) : false}
                        </ul>
                    </section>
                </div>
                <div className="wallet-operation">
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_CREATE_ACCOUNT)}>CREATE ACCOUNT</SelectButton>
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_UPDATE_KEY)}>UPDATE KEY</SelectButton>
                    <SelectButton size="wide" onClick={() => this.onSelect(OPER_TRANSFER)}>TRANSFER</SelectButton>
                </div>
                <div className="wallet-history">
                    {title('HISTORY')}
                    <ul>
                        {this.props.history.length > 0 ? this.props.history.map(x => history(x)) : false}
                    </ul>
                    <p id='pend' onClick={() => this.openPendModal()}>
                        {this.state.isQueueUpdate ? `${this.props.queue.length} 개의 작업을 처리 중입니다.` : false}
                    </p>
                </div>
                <PublicKeyModal onClose={() => this.closePubModal()} isOpen={this.state.isPubModalOpen} />
                <PendingModal onClose={() => this.closePendModal()} isOpen={this.state.isPendModalOpen} />
            </div >
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,
    history: state.login.history,
    queue: state.queue.queue
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, privateKey, data) => dispatch(login(address, privateKey, data)),
    deleteJob: () => dispatch(dequeueOperation())
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Wallet));