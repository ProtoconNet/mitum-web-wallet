import React from 'react';
import { Redirect } from 'react-router-dom';

import './Operation.scss';

import CreateAccount from '../components/operations/CreateAccount';
import UpdateKey from '../components/operations/UpdateKey';
import Transfer from '../components/operations/Transfer';
import { connect } from 'react-redux';

import * as mode from '../text/mode';
import { isStateValid } from '../lib/Validation';

class Operation extends React.Component {
    constructor(props) {
        super(props);

        if (!isStateValid(this.props)
            || !Object.prototype.hasOwnProperty.call(this.props.location.state, 'operation') || !this.props.location.state.operation
            || !this.props.isLogin) {

            this.state = {
                isRedirect: true,
                account: undefined,
                operation: undefined
            };
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
                {this.state.operation === mode.OPER_CREATE_ACCOUNT ?
                    <CreateAccount account={this.state.account} /> : (
                        this.state.operation === mode.OPER_UPDATE_KEY ?
                            <UpdateKey account={this.state.account} /> : (
                                this.state.operation === mode.OPER_TRANSFER ?
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