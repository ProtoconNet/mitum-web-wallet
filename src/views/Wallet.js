import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { dequeueOperation, login, setAccountList, setHistory } from '../store/actions';
import './Wallet.scss';

import SelectButton from '../components/buttons/SelectButton';
import PublicKeyModal from '../components/modals/PublicKeyModal';
import PendingModal from '../components/modals/PendingModal';
import axios from 'axios';

import { isAccountValid } from '../lib/Validation';

import Sleep from '../lib/Sleep';
import { OPER_CREATE_ACCOUNT, OPER_TRANSFER, OPER_UPDATE_KEY, PAGE_ACC_SEL, PAGE_LOGIN, PAGE_OPER } from '../text/mode';
import AlertModal from '../components/modals/AlertModal';
import { parseDecimal, toPrecision } from '../lib/Parse';

function openTab(url) {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
}

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
        <li key={hist.hash + hist.currency + hist.target} onClick={() => { openTab(process.env.REACT_APP_EXPLORER + "/operation/" + hist.hash) }}>
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

let keepRefresh = false;

class Wallet extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            restoreKey: undefined,

            isPubModalOpen: false,
            isPendModalOpen: false,
            isQueueUpdate: 1,

            isAlertOpen: false,
            alertTitle: "",
            alertMsg: "",

            isRedirect: this.props.isLogin ? false : true,
            redirect: this.props.isLogin ? undefined : PAGE_LOGIN,
            operation: undefined
        }
    }

    closeAlert() {
        this.setState({
            isAlertOpen: false
        })
    }

    openAlert(title, msg) {
        this.setState({
            isAlertOpen: true,
            alertTitle: title,
            alertMsg: msg,
        })
    }

    async getFactInState(hash) {
        return await axios.get(this.props.networkSearchFact + hash);
    }

    async checkInState() {
        while (!this.props.queue.isEmpty()) {
            const target = this.props.queue.target;

            if (!target) {
                break;
            }

            var isResult = false;
            this.getFactInState(target.hash)
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
                await Sleep(5000);
            }
        }
    }

    async getAccountInformation(account) {
        return await axios.get(this.props.networkAccount + account)
    }

    async getAccountHistory(account) {
        return await axios.get(`${this.props.networkAccount}${account}/operations?reverse=1`)
    }

    componentDidMount() {
        this.checkInState();

        keepRefresh = true;

        setTimeout(() => {
            this.keepRefresh();
        }, 5000);
    }

    componentWillUnmount() {
        keepRefresh = false;
    }

    keepRefresh() {
        if (!keepRefresh) {
            return;
        }

        this.refresh();

        return setTimeout(() => {
            this.keepRefresh();
        }, 5000);
    }

    refresh() {
        this.getAccountHistory(this.props.account.address)
            .then(
                res => {
                    this.props.setHistory(res.data, this.props.account.address);
                }
            )
            .catch(
                e => {
                    console.error('fail to load account history');
                }
            )

        this.getAccountInformation(this.props.account.address)
            .then(
                res => {
                    if (this.props.isLoginAllowed) {
                        this.props.signIn(this.props.account.address, this.props.priv, this.props.pub, res.data);
                    }
                }
            )
            .catch(
                e => {
                    console.error('fail to load account information');
                }
            )
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

    async getPubAccounts(pub) {
        return await axios.get(`${this.props.networkPubAccounts}${pub}`);
    }

    goAccountSelector() {
        this.getPubAccounts(this.props.pub)
            .then(
                res => {
                    if (res.data._embedded == null) {
                        this.openAlert("오류 발생! :(", "계정 목록을 불러올 수 없습니다. 잠시후 다시 시도해 보세요.");
                        return;
                    }

                    let result = res.data._embedded.map(
                        x => {
                            return (x._embedded.address)
                        }
                    );
                    result.unshift(res.data._links.next.href);

                    return result;
                }
            )
            .then(
                res => {
                    if (res == null || res.length < 2) {
                        this.openAlert("오류 발생! :(", "계정 목록을 불러올 수 없습니다. 잠시후 다시 시도해 보세요.");
                        return;
                    }

                    const next = res.shift();
                    this.props.setAccountList(res, next);

                    this.setState({
                        redirect: PAGE_ACC_SEL,
                        isRedirect: true,
                    });
                }
            )
            .catch(
                e => this.openAlert("오류 발생! :(", "계정 목록을 불러올 수 없습니다. 잠시후 다시 시도해 보세요.")
            )
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
            else if (this.state.redirect === PAGE_ACC_SEL) {
                return <Redirect to='/account-select' />;
            }
        }

        return (
            <div className="wallet-container" >
                <div id='wallet-refresh'>
                    <p id="change-account" onClick={() => this.goAccountSelector()}>change account</p>
                    <p id="refresh" onClick={() => this.refresh()}>↻</p>
                </div>
                <div className="wallet-info">
                    {title("ADDRESS" + (this.props.account.accountType === "multi" ? " - MULTI" : " - SINGLE"))}
                    <p id='address' onClick={() => this.openPubModal()}>{this.props.account.address}</p>
                    <section className="wallet-amount">
                        {title('BALANCE')}
                        <ul>
                            {
                                this.props.account.balances
                                    ? this.props.account.balances.map(
                                        x => balance({
                                            ...x,
                                            amount: toPrecision(parseDecimal(x.amount), this.props.precision)
                                        }))
                                    : false
                            }
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
                        {this.props.history.length > 0
                            ? this.props.history.map(
                                x => history({
                                    ...x,
                                    amount: toPrecision(parseDecimal(x.amount), this.props.precision)
                                }))
                            : false}
                    </ul>
                    <p id='pend' onClick={() => this.openPendModal()}>
                        {this.state.isQueueUpdate ? `이 브라우저에서 전송된 ${this.props.queue.length} 개의 작업을 처리 중입니다.` : false}
                    </p>
                </div>
                <PublicKeyModal onClose={() => this.closePubModal()} isOpen={this.state.isPubModalOpen} />
                <PendingModal onClose={() => this.closePendModal()} isOpen={this.state.isPendModalOpen} />
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div >
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,
    history: state.login.history,
    queue: state.queue.queue,
    networkSearchFact: state.network.networkSearchFact,
    networkPubAccounts: state.network.networkPubAccounts,
    networkAccount: state.network.networkAccount,
    precision: state.network.precision,
    priv: state.login.priv,
    pub: state.login.pub,
    isLoginAllowed: state.allow.isLoginAllowed,
});

const mapDispatchToProps = dispatch => ({
    setAccountList: (accList, next) => dispatch(setAccountList(accList, next)),
    deleteJob: () => dispatch(dequeueOperation()),
    setHistory: (data, me) => dispatch(setHistory(data, me)),
    signIn: (address, privateKey, publicKey, data) => dispatch(login(address, privateKey, publicKey, data)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Wallet));