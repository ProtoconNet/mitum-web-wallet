import React, { createRef } from 'react';
import './Transfer.scss';

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

class Transfer extends React.Component {

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

            amounts: [],

            currency: "",
            amount: "",
            address: "",

            created: undefined
        }
    }

    onClick() {
        const generator = new Generator(process.env.REACT_APP_NETWORK_ID);

        const account = this.props.account;
        const amounts = generator.createAmounts(
            this.state.amounts.map(x =>
                generator.formatAmount(parseInt(x.amount), x.currency))
        );

        const transfersFact = generator.createTransfersFact(
            account.address,
            [generator.createTransfersItem(
                this.state.address, amounts
            )]
        );

        const transfers = generator.createOperation(transfersFact, "");
        transfers.addSign(account.privateKey);

        this.setState({
            created: transfers.dict()
        })
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

    onChangeAddress(e) {
        this.setState({
            address: e.target.value
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
        })
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
        else if (this.createdRef.current && !this.state.created && this.state.amounts.length > 0) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.titleRef.current && !this.state.created) {
            this.titleRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    render() {
        const account = this.props.account;
        return (
            <div className="tf-container">
                {this.state.isRedirect ? <Redirect to='/login' /> : false}
                <div ref={this.titleRef}></div>
                <h1>TRANSFER</h1>
                <div className="tf-balance-wrap">
                    <ul>
                        {account.balances ? account.balances.map(x => balance(x)) : false}
                    </ul>
                </div>
                <div ref={this.createdRef}></div>
                <div className="tf-input-wrap">
                    <div className="tf-address">
                        <h2>TRANSFER TO</h2>
                        <InputBox size="medium" useCopy={false} disabled={false} placeholder="account address"
                            value={this.state.address}
                            onChange={(e) => this.onChangeAddress(e)} />
                    </div>
                    <div className="tf-amounts">
                        <h2>AMOUNTS</h2>
                        <ul>
                            {this.state.amounts.map(x => balance(x))}
                        </ul>
                        <span className="tf-amount-adder">
                            <InputBox size="medium" useCopy={false} disabled={false} placeholder="currency"
                                onChange={(e) => this.onChangeCurrency(e)}
                                value={this.state.currency} />
                            <InputBox size="small" useCopy={false} disabled={false} placeholder="amount"
                                value={this.state.amount}
                                onChange={(e) => this.onChangeAmount(e)} />
                            <AddButton
                                disabled={!(this.state.currency && this.state.amount) ? true : false}
                                onClick={() => this.addAmount()} />
                        </span>
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.amounts.length < 1 || this.state.address === "" ? true : false}
                    onClick={() => this.onClick()}>CREATE</ConfirmButton>

                <div ref={this.jsonRef}></div>
                {this.state.created ?
                    <NewOperation json={this.state.created} /> : false}
            </div>
        );
    }
}
export default Transfer;