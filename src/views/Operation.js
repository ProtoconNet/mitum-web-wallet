import React from 'react';
import { Redirect } from 'react-router-dom';

import './Operation.scss';

import CreateAccount from '../components/CreateAccount';
import UpdateKey from '../components/UpdateKey';
import Transfer from '../components/Transfer';
import { connect } from 'react-redux';

const OPER_CREATE_ACCOUNT = 'oper-create-account';
const OPER_UPDATE_KEY = 'oper-update-key';
const OPER_TRANSFER = 'oper-transfer';


class Operation extends React.Component {
    constructor(props) {
        super(props);

        if (!this.props.hasOwnProperty('location') || !this.props.location
            || !this.props.location.hasOwnProperty('state') || !this.props.location.state
            || !this.props.location.state.hasOwnProperty('operation') || !this.props.location.state.operation
            || !this.props.isLogin) {
            this.state = {
                isRedirect: true,
                account: undefined,
                operation: undefined
            }
            return;
        }

        this.state = {
            isRedirect: this.props.isLogin ? false : true,
            account: this.props.account,
            operation: this.props.location.state.operation
        }
    }

    render() {
        let redirect;
        if (this.props.isLogin) {
            redirect = `/wallet/${this.props.account.address}`;
        }
        else {
            redirect = '/login';
        }

        return (
            <div className="oper-container">
                {this.state.isRedirect ? <Redirect to={redirect} /> : false}
                {this.state.operation === OPER_CREATE_ACCOUNT ?
                    <CreateAccount account={this.state.account} /> : (
                        this.state.operation === OPER_UPDATE_KEY ?
                            <UpdateKey account={this.state.account} /> : (
                                this.state.operation === OPER_TRANSFER ?
                                    <Transfer account={this.state.account} /> : <Redirect to={redirect} />
                            ))}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account
});

export default connect(
    mapStateToProps,
)(Operation);