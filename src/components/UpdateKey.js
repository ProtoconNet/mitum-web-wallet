import React, { createRef } from 'react';
import './UpdateKey.scss';

import InputBox from './InputBox';
import AddButton from './buttons/AddButton';
import ConfirmButton from './buttons/ConfirmButton';
import NewOperation from './NewOperation';

import { Generator } from 'mitumc';
import { Redirect } from 'react-router-dom';

const balance = (amount) => {
    return (
        <li key={amount.currency}>
            <span className="currency">{amount.currency}</span>
            <span className="amount">{amount.amount}</span>
        </li>
    );
}

const key = (k) => {
    return (
        <li key={k}>
            <span className="key">{k.key}</span>
            <span className="weight">{k.weight}</span>
        </li>
    );
}

class UpdateKey extends React.Component {

    constructor(props) {
        super(props);

        this.renderRedirect = this.renderRedirect.bind(this);
        this.createdRef = createRef();
        
        if(!this.props.hasOwnProperty('account') || !this.props.hasOwnProperty('privateKey') || !this.props.hasOwnProperty('data')
            || !this.props.account || !this.props.privateKey || !this.props.data) {
                this.state = { isRedirect: true }
                return;
        }

        this.state = {
            isRedirect: false,

            account: this.props.account,
            privateKey: this.props.privateKey,
            data: this.props.data,

            keys: [],
            threshold: "",
            currency: "",

            publicKey: "",
            weight: "",

            created: undefined
        }
    }

    onClick() {
        const generator = new Generator(process.env.REACT_APP_NETWORK_ID);
        
        const keys = generator.createKeys(
            this.state.keys.map(x => 
                generator.formatKey(x.key, parseInt(x.weight))),
            parseInt(this.state.threshold)
        );

        const keyUpdaterFact = generator.createKeyUpdaterFact(
            this.state.account, this.state.currency, keys
        );

        const keyUpdater = generator.createOperation(keyUpdaterFact, "");
        keyUpdater.addSign(this.state.privateKey);

        this.setState({
            created: keyUpdater.dict()
        })
    }

    onChangePub(e) {
        this.setState({
            publicKey: e.target.value
        });
    }

    onChangeWeight(e) {
        this.setState({
            weight: e.target.value
        });
    }

    onChangeThres(e) {
        this.setState({
            threshold: e.target.value
        });
    }

    onChangeCurrency(e) {
        this.setState({
            currency: e.target.value
        });
    }

    addKey() {
        this.setState({
            keys: [...this.state.keys, {
                key: this.state.publicKey, 
                weight: this.state.weight
            }],
            publicKey: "",
            weight: "",
        });
    }

    componentDidMount () {
        this.scrollToJSON();
    }
    
    componentDidUpdate () {
        this.scrollToJSON();
    }

    scrollToJSON = () => {
        if (!this.createdRef.current) return;
        this.createdRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    renderRedirect() {
        if(this.state.isRedirect) {
            return <Redirect to='/login'/>
        }
    }

    render() {
        return (
            <div className="uk-container">
            <h1>UPDATE KEY</h1>
            <div className="uk-address-wrap">
                <h2>{this.state.account}</h2>
                <ul>{this.state.data.publicKey ? this.state.data.publicKey.map(x => key(x)) : false }</ul>
            </div>
            <div className="uk-amount-wrap">
                <h2>BALANCE</h2>
                <ul>{this.state.data.balance ? this.state.data.balance.map(x => balance(x)) : false }</ul>
            </div>
            <div className="uk-input-wrap">
                <div className="uk-keys">
                    <h2>NEW KEYS</h2>
                    <div className="uk-keys-extra-input">
                        <InputBox 
                            size="small" useCopy={false} disabled={false} placeholder='threshold'
                            value={this.state.threshold}
                            onChange={(e) => this.onChangeThres(e)}/>
                        <InputBox 
                            size="small" useCopy={false} disabled={false} placeholder='currency'
                            value={this.state.currency}
                            onChange={(e) => this.onChangeCurrency(e)}/>
                    </div>
                        
                    <ul>
                        { this.state.keys.map(x => key(x)) }
                    </ul>
                        <span className="uk-key-adder">
                            <InputBox size="medium" useCopy={false} disabled={false} placeholder="public key"
                                value={this.state.publicKey} 
                                onChange={(e) => this.onChangePub(e)}/>
                            <InputBox size="small" useCopy={false} disabled={false} placeholder="weight"
                                value={this.state.weight} 
                                onChange={(e) => this.onChangeWeight(e)}/>
                            <AddButton 
                                disabled={ !(this.state.publicKey && this.state.weight) ? true: false }
                                onClick={() => this.addKey()}/>
                        </span>
                    </div>
                </div>
                <ConfirmButton
                    disabled={ this.state.keys.length < 1 || this.state.threshold==="" || this.state.currency==="" ? true : false }
                    onClick={() => this.onClick()}>UPDATE</ConfirmButton>
                    <div ref={this.createdRef}></div>
                    { this.state.created ? 
                        <NewOperation data={{
                            json: this.state.created,
                            privateKey: this.state.privateKey,
                            account: this.state.account,
                            accountType: this.state.accountType}}/> : false }
            </div>
        );
    }
}
export default UpdateKey;