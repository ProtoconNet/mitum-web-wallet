import axios from 'axios';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import AlertModal from '../components/modals/AlertModal';
import { login, setAccountList } from '../store/actions';
import './AccountSelector.scss';

class AccountSelector extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRedirect: false,
            isLoadAll: false,

            isAlertOpen: false,
            alertTitle: "",
            alertMsg: "",
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

    liAccount(account) {
        const link = this.props.networkAccount + account;
        return <li id="account" onClick={() => this.onSelect(link, account)}>{account}</li>
    }

    onSelect(link, addr) {
        this.getAccountInformation(link)
            .then(
                res => {
                    this.props.signIn(addr, this.props.priv, this.props.pub, res.data);
                    this.setState({
                        isRedirect: true
                    });
                }
            )
            .catch(
                e => {
                    this.openAlert("계정 열기 실패 :(", "잘못된 주소 혹은 네트워크 문제로 계정 열기에 실패하였습니다.");
                }
            )
    }

    async getAccountInformation(account) {
        return await axios.get(account);
    }

    async getNext(next) {
        return await axios.get(next);
    }

    load() {
        this.getNext(this.props.next)
            .then(
                res => {
                    if (res.data._embedded === null) {
                        this.setState({
                            isLoadAll: true
                        });
                        return;
                    }

                    let accountList = this.props.accountList;
                    accountList = accountList.concat(
                        res.data._embedded.map(
                            x => x._embedded.address
                        )
                    );
                    if (accountList.find(el => el === this.props.account.address) === undefined) {
                        accountList.push(this.props.account.address)
                    }
                    accountList = [
                        ...new Set(accountList)
                    ];

                    this.props.setAccountList(accountList, res.data._links.next.href);
                }
            )
    }

    render() {
        return (
            <div className="account-selector-container">
                {this.state.isRedirect ? <Redirect to="/login" /> : false}
                <h1>ACCOUNT LIST</h1>
                <ul>
                    {
                        this.props.accountList.map(x => (this.liAccount(x)))
                    }
                    <li id="load"
                        onClick={() => this.load()}>{this.state.isLoadAll ? "No More Account" : "See More"}</li>
                </ul>
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,
    accountList: state.login.accountList,
    networkAccount: state.network.networkAccount,
    next: state.login.next,
    priv: state.login.priv,
    pub: state.login.pub,
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, priv, pub, data) => dispatch(login(address, priv, pub, data)),
    setAccountList: (list, next) => dispatch(setAccountList(list, next)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(AccountSelector));