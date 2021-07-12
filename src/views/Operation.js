import React from 'react';
import { Redirect } from 'react-router-dom';

import CreateAccount from '../components/CreateAccount';
import UpdateKey from '../components/UpdateKey';
import Transfer from '../components/Transfer';

const OPER_CREATE_ACCOUNT = 'oper-create-account';
const OPER_UPDATE_KEY = 'oper-update-key';
const OPER_TRANSFER = 'oper-transfer';

class Operation extends React.Component {
    constructor(props) {
        super(props);

        if(!this.props.hasOwnProperty('location')|| !this.props.location.hasOwnProperty('state')
            || !this.props.location || !this.props.location.state) {
            
                this.state = {
                    isRedirect: true
                }
                return;
        }
        const _state = this.props.location.state;
        if(!_state.hasOwnProperty('privateKey') || !_state.hasOwnProperty('operation') 
            || !_state.hasOwnProperty('account') || !_state.hasOwnProperty('data')
            || !_state.privateKey || !_state.operation || !_state.account || !_state.data){
                
                this.state = {
                    isRedirect: true
                }
                return;   
        }

        this.state = {
            isRedirect: false,
            privateKey: _state.privateKey,
            operation: _state.operation,
            account: _state.account,
            data: _state.data
        }
    }

    render() {
        return (
            <div className="oper-container">
                { this.state.isRedirect ? <Redirect to='/login'/> : false}
                { this.state.operation === OPER_CREATE_ACCOUNT ?  
                        <CreateAccount data={this.state.data} 
                            privateKey={this.state.privateKey} 
                            account={this.state.account}/> : (
                    this.state.operation === OPER_UPDATE_KEY ? 
                        <UpdateKey data={this.state.data}
                            privateKey={this.state.privateKey} 
                            account={this.state.account}/> : (
                    this.state.operation === OPER_TRANSFER ? 
                        <Transfer data={this.state.data}
                            privateKey={this.state.privateKey} 
                            account={this.state.account}/> : <Redirect to='/login' />
                ))}
            </div>
        );
    }
}

export default Operation;