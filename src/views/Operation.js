import React from 'react';
import { Redirect } from 'react-router-dom';

import './Operation.scss';

import CreateAccount from '../components/operations/CreateAccount';
import UpdateKey from '../components/operations/UpdateKey';
import Transfer from '../components/operations/Transfer';
import { connect } from 'react-redux';

import { isStateValid } from '../lib/Validation';
import { OPER_CREATE_ACCOUNT, OPER_TRANSFER, OPER_UPDATE_KEY } from '../text/mode';

class Operation extends React.Component {
    constructor(props) {
        super(props);

        if (!isStateValid(this.props)
            || !Object.prototype.hasOwnProperty.call(this.props.location.state, 'operation') || !this.props.location.state.operation
            || !this.props.isLogin) {

            this.state = {
                isRedirect: true,
                operation: undefined
            };
            return;
        }

        this.state = {
            isRedirect: false,
            operation: this.props.location.state.operation
        }
    }

    renderOperation() {
        switch (this.state.operation) {
            case OPER_CREATE_ACCOUNT:
                return <CreateAccount account={this.props.account} />;
            case OPER_UPDATE_KEY:
                return <UpdateKey account={this.props.account} />;
            case OPER_TRANSFER:
                return <Transfer account={this.props.account} />;
            default:
                return <Redirect to={`/wallet/${this.props.account.address}`} />;
        }
    }

    render() {
        if (!this.props.isLogin) {
            return <Redirect to='/login' />;
        }
        if (this.state.isRedirect) {
            return <Redirect to={`/wallet/${this.props.account.address}`} />;
        }
        
        return (
            <div className="oper-container">
                {this.renderOperation()}
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