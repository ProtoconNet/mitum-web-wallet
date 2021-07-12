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

const amount = (am) => {
    return (
        <li key={am.currency}>
            <span>{am.currency}</span>
            <span>{am.amount}</span>
        </li>
    );
}

class Transfer extends React.Component {

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

            amounts: [],

            account: this.props.account,
            privateKey: this.props.privateKey,
            data: this.props.data,

            currency: "",
            amount: "",
            address: "",

            created: undefined
        }
    }

    onClick() {
        const generator = new Generator(process.env.REACT_APP_NETWORK_ID);

        const amounts = generator.createAmounts(
            this.state.amounts.map(x => 
                generator.formatAmount(parseInt(x.amount), x.currency))
        );

        const transfersFact = generator.createTransfersFact(
            this.state.account,
            [generator.createTransfersItem(
                this.state.address, amounts
            )]
        );

        const transfers = generator.createOperation(transfersFact, "");
        transfers.addSign(this.state.privateKey);

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
            return <Redirect to='/login' />;
        }
    }

    render() {
        return (
            <div className="tf-container">
                <h1>TRANSFER</h1>
                <div className="tf-balance-wrap">
                    <ul>
                        { this.state.data.balance ? this.state.data.balance.map(x => balance(x)) : false }
                    </ul>
                </div>
                <div className="tf-input-wrap">
                    <div className="tf-address">
                        <h2>TRANSFER TO</h2>
                        <InputBox size="medium" useCopy={false} disabled={false} placeholder="account address"
                            value={this.state.address}
                            onChange={(e) => this.onChangeAddress(e)}/>
                    </div>
                        <div className="tf-amounts">
                            <h2>AMOUNTS</h2>
                            <ul>
                                { this.state.amounts.map(x => amount(x)) }
                            </ul>
                            <span className="tf-amount-adder">
                                <InputBox size="medium" useCopy={false} disabled={false} placeholder="currency" 
                                    onChange={(e) => this.onChangeCurrency(e)}
                                    value={this.state.currency}/>
                                <InputBox size="small" useCopy={false} disabled={false} placeholder="amount"
                                    value={this.state.amount}
                                    onChange={(e) => this.onChangeAmount(e)}/>
                                <AddButton 
                                    disabled={ !(this.state.currency && this.state.amount) ? true: false }
                                    onClick={() => this.addAmount()}/>
                            </span>
                        </div>
                    </div>
                <ConfirmButton
                    disabled={ this.state.amounts.length < 1 || this.state.address==="" ? true : false }
                    onClick={() => this.onClick()}>CREATE</ConfirmButton>

                <div ref={this.createdRef}></div>
                { this.state.created ? 
                    <NewOperation data={{
                        json: this.state.created,
                        privateKey: this.state.privateKey,
                        account: this.state.account,
                        accountType: this.state.accountType}}/> : false }

                <div ref={this.createdRef}></div>
            </div>
        );
    }
}
export default Transfer;