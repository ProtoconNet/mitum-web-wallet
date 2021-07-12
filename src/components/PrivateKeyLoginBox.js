import React from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';

import './PrivateKeyLoginBox.scss';

import InputBox from './InputBox';
import ConfirmButton from './buttons/ConfirmButton';

import {toKeypair} from 'mitumc';

const getAccountInformation = async (account) => {
    try {
        return await axios.get(process.env.REACT_APP_API_ACCOUNT + account);
    } catch(e) {
        alert(`Could not sign in\n${account}`);
    }
} 

class PrivateKeyLoginBox extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            privateKey: "",
            account : "",
            data: undefined,
            redirect: undefined
        }
    }

    onChangePrivate(e) { 
        this.setState({
            privateKey: e.target.value
        });
    }

    onChangeAddress(e) {
        this.setState({
            account: e.target.value
        });
    }
    
    onClick() {
        const privateKey = this.state.privateKey;
        const account = this.state.account;
        let pubKey;
        
        try {
            pubKey = toKeypair(privateKey, '').getPublicKey();
        } catch(e) {
            alert('Invalid private key');
            return;
        }

        getAccountInformation(account)
                .then(
                    res => {
                        const pubKeys = res.data._embedded.keys.keys.map(x => x.key);
                        
                        for(let i=0; i < pubKeys.length; i++) {
                            if(pubKeys[i] === pubKey) {
                                this.setState({
                                    redirect: `/wallet/${account}`,
                                    data: res.data,
                                    account: account,
                                    privateKey: this.state.privateKey
                                })
                                return;
                            }
                        }
                        alert(`Could not sign in\naccount: ${account}`);
                    }
                )
                .catch(
                    e => {
                        alert(`Could not sign in\naccount: ${account}`);
                    }
                );
    }

    redirect() {
        if(this.state.redirect) {
            alert(`Hello, ${this.state.account}!`);
            return <Redirect to={{ 
                pathname: this.state.redirect,
                state: {
                    privateKey: this.state.privateKey,
                    data: this.state.data,
                    account: this.state.account,
                }
            }} />
        }
        else{
            return false;
        }
    }

    render() {
        return (
            <div className="private-login-container">
                <div className="private-input-container">
                    <InputBox disabled={false} useCopy={false} size="big"
                        onChange={(e) => {this.onChangeAddress(e)}}
                        value={this.state.account}
                        placeholder="account address"/>
                    <InputBox disabled={false} useCopy={false} size="big"
                        onChange={(e) => this.onChangePrivate(e)}
                        value={this.state.privateKey}
                        placeholder="priavate key"/>
                </div>
                <ConfirmButton
                    disabled={!(this.state.privateKey && this.state.account) ? true : false}
                    onClick={() => this.onClick()}>Open</ConfirmButton>
                { this.redirect() }
            </div>
        )
    }
}
export default PrivateKeyLoginBox;