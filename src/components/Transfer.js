import React, { createRef } from 'react';
import './Transfer.scss';

import InputBox from './InputBox';
import ConfirmButton from './buttons/ConfirmButton';

import { Generator } from 'mitumc';
import { Redirect } from 'react-router-dom';
import SmallButton from './buttons/SmallButton';
import OperationConfirm from './modals/OperationConfirm';

const balance = (amount) => {
    return (
        <li key={amount.currency}>
            <span className="currency">{amount.currency}</span>
            <span className="amount">{amount.amount}</span>
        </li>
    );
}

const download = (json) => {
    if (!json || !Object.prototype.hasOwnProperty.call(json, 'hash')) {
        return undefined;
    }

    let file;
    try {
        file = new File([JSON.stringify(json, null, 4)], `${json.hash}`, { type: 'application/json' });
    } catch (e) {
        alert('Could not get url');
        return undefined;
    }

    return URL.createObjectURL(file);
}

class Transfer extends React.Component {

    constructor(props) {
        super(props);

        this.createdRef = createRef();
        this.titleRef = createRef();

        if (!Object.prototype.hasOwnProperty.call(this.props, 'account') || !this.props.account) {
            this.state = { isRedirect: true }
            return;
        }

        this.state = {
            isRedirect: false,

            amounts: [],

            currency: "",
            amount: "",
            address: "",

            created: undefined,
            isModalOpen: false,

            download: undefined,
            filename: ""
        }
    }

    closeModal() {
        this.setState({ isModalOpen: false })
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

        const created = transfers.dict();

        this.setState({
            created: created,
            isModalOpen: true,
            download: download(created),
            filename: created.hash
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

        if (this.createdRef.current && !this.state.created && this.state.amounts.length > 0) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.titleRef.current && !this.state.created) {
            this.titleRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    render() {
        const account = this.props.account;
        const labelStyle = {
            textAlign: 'center'
        };
        const lineStyle = {
            border: '2px solid white',
            backgroundColor: 'white'
        };
        const emptyliStyle = {
            opacity: '0.6'
        }
        const emptyStyle = {
            backgroundColor: 'white',
            textAlign: 'center',
            color: 'black',
            padding: '0.3em',
            margin: '0.2em'
        }
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
                            <li>
                                <span style={labelStyle} className='currency'>CURRENCY</span>
                                <span style={labelStyle} className='amount'>AMOUNT</span>
                            </li>
                            <li>
                                <span style={lineStyle}></span>
                                <span style={lineStyle}></span>
                            </li>
                            {this.state.amounts.length < 1
                                ? (
                                    <li style={emptyliStyle} >
                                        <span style={emptyStyle} className='currency'>-</span>
                                        <span style={emptyStyle} className='amount'>-</span>
                                    </li>
                                ) : false}
                            {this.state.amounts.length > 0 ? this.state.amounts.map(x => balance(x)) : false}
                        </ul>
                        <span className="tf-amount-adder">
                            <InputBox size="small" useCopy={false} disabled={false} placeholder="currency"
                                onChange={(e) => this.onChangeCurrency(e)}
                                value={this.state.currency} />
                            <InputBox size="medium" useCopy={false} disabled={false} placeholder="amount"
                                value={this.state.amount}
                                onChange={(e) => this.onChangeAmount(e)} />
                            <SmallButton
                                visible={true}
                                disabled={!(this.state.currency && this.state.amount) ? true : false}
                                onClick={() => this.addAmount()}>ADD</SmallButton>
                        </span>
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.amounts.length < 1 || this.state.address === "" ? true : false}
                    onClick={() => this.onClick()}>TRANSFER</ConfirmButton>

                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}
                    title="Are you sure?"
                    json={this.state.created}
                    filename={this.state.filename}
                    download={this.state.download} />
            </div>
        );
    }
}
export default Transfer;