import React, { createRef } from 'react';
import './CreateAccount.scss';

import AddButton from './buttons/AddButton';
import ConfirmButton from './buttons/ConfirmButton';
import InputBox from './InputBox';
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

class CreateAccount extends React.Component {
    constructor(props) {
        super(props);

        this.createdRef = createRef();
        this.jsonRef = createRef();
        this.titleRef = createRef();

        if (!this.props.hasOwnProperty('account') || !this.props.account) {
            this.state = { isRedirect: true }
            return;
        }

        this.state = {
            isRedirect: false,

            keys: [],
            amounts: [],
            threshold: "",

            publicKey: "",
            weight: "",
            currency: "",
            amount: "",

            created: undefined
        }
    }

    onClick() {
        const generator = new Generator(process.env.REACT_APP_NETWORK_ID);
        const account = this.props.account;

        const keys = generator.createKeys(
            this.state.keys.map(x =>
                generator.formatKey(x.key, parseInt(x.weight))),
            parseInt(this.state.threshold)
        );

        const amounts = generator.createAmounts(
            this.state.amounts.map(x =>
                generator.formatAmount(parseInt(x.amount), x.currency))
        );

        const createAccountsFact = generator.createCreateAccountsFact(
            account.address,
            [generator.createCreateAccountsItem(
                keys, amounts
            )]
        );

        const createAccounts = generator.createOperation(createAccountsFact, "");
        createAccounts.addSign(account.privateKey);

        this.setState({
            created: createAccounts.dict()
        });
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

    onChangeCurrency(e) {
        this.setState({
            currency: e.target.value
        });
    }

    onChangeAmount(e) {
        this.setState({
            amount: e.target.value
        });
    }

    onChangeThres(e) {
        this.setState({
            threshold: e.target.value
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

    addAmount() {
        this.setState({
            amounts: [...this.state.amounts, {
                currency: this.state.currency,
                amount: this.state.amount
            }],
            currency: "",
            amount: ""
        });
    }

    componentDidMount() {
        this.scrollToInput();
    }

    componentDidUpdate() {
        this.scrollToInput();
    }

    scrollToInput = () => {

        if (this.jsonRef.current && this.state.created) {
            this.jsonRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.createdRef.current && !this.state.created && (this.state.keys.length > 0 || this.state.amount.length > 0)) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.titleRef.current && !this.state.created) {
            this.titleRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    render() {
        const account = this.props.account;
        return (
            <div className="ca-container">
                {this.state.isRedirect ? <Redirect to='/login' /> : false}
                <div ref={this.titleRef}></div>
                <h1>CREATE ACCOUNT</h1>
                <div className="ca-balance-wrap">
                    <ul>
                        {account.balances ? account.balances.map(x => balance(x)) : false}
                    </ul>
                </div>
                <div ref={this.createdRef}></div>
                <div className="ca-input-wrap">
                    <div className="ca-keys">
                        <h2>KEYS</h2>
                        <InputBox className="ca-thres-input"
                            size="small" useCopy={false} disabled={false} placeholder='threshold'
                            value={this.state.threshold}
                            onChange={(e) => this.onChangeThres(e)} />
                        <ul>
                            {this.state.keys ? this.state.keys.map(x => key(x)) : false}
                        </ul>
                        <span className="ca-key-adder">
                            <InputBox className="ca-pub-input" size="medium" useCopy={false} disabled={false} placeholder="public key"
                                value={this.state.publicKey}
                                onChange={(e) => this.onChangePub(e)} />
                            <InputBox className="ca-weight-input" size="small" useCopy={false} disabled={false} placeholder="weight"
                                value={this.state.weight}
                                onChange={(e) => this.onChangeWeight(e)} />
                            <AddButton
                                disabled={!(this.state.publicKey && this.state.weight) ? true : false}
                                onClick={() => this.addKey()} />
                        </span>
                    </div>

                    <div className="ca-amounts">
                        <h2>AMOUNTS</h2>
                        <ul>
                            {this.state.amounts ? this.state.amounts.map(x => balance(x)) : false}
                        </ul>
                        <span className="ca-amount-adder">
                            <InputBox className="ca-currency-input"
                                size="medium" useCopy={false} disabled={false} placeholder="currency"
                                onChange={(e) => this.onChangeCurrency(e)}
                                value={this.state.currency} />
                            <InputBox className="ca-amount-input" 
                                size="small" useCopy={false} disabled={false} placeholder="amount"
                                value={this.state.amount}
                                onChange={(e) => this.onChangeAmount(e)} />
                            <AddButton
                                disabled={!(this.state.currency && this.state.amount) ? true : false}
                                onClick={() => this.addAmount()}>ADD</AddButton>
                        </span>
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.amounts.length < 1 || this.state.keys.length < 1 || this.state.threshold === "" ? true : false}
                    onClick={() => this.onClick()}>CREATE</ConfirmButton>

                <div ref={this.jsonRef}></div>
                {this.state.created ?
                    <NewOperation json={this.state.created} /> : false}
            </div>
        );
    }
}
export default CreateAccount;