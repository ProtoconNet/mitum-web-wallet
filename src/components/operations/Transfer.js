import React, { createRef } from 'react';
import './Transfer.scss';

import InputBox from '../InputBox';
import ConfirmButton from '../buttons/ConfirmButton';

import { Generator } from 'mitumc';
import { Redirect } from 'react-router-dom';
import SmallButton from '../buttons/SmallButton';
import OperationConfirm from '../modals/OperationConfirm';

import download from '../../lib/Url';

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
        try {
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
        catch (e) {
            console.log(e);
            alert('작업을 생성할 수 없습니다. :(\n입력하신 작업 내용을 확인해주세요~');
        }
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

        if (this.createdRef.current && this.state.amounts.length > 0) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.titleRef.current) {
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
                    <p id="head">CURRENT BALANCE LIST</p>
                    <ul>
                        {account.balances ? account.balances.map(x => balance(x)) : false}
                    </ul>
                </div>
                <div className="tf-input-wrap">
                    <div ref={this.createdRef} />
                    <div className="tf-amounts">
                        <p id="head">AMOUNT LIST</p>
                        <div id="label">
                            <p className='currency'>CURRENCY ID</p>
                            <p className='amount'>AMOUNT</p>
                        </div>
                        <ul>
                            {this.state.amounts.length > 0 ? this.state.amounts.map(x => balance(x)) : false}
                        </ul>
                        <section>
                            <div className="tf-amount-adder">
                                <InputBox
                                    size="small" useCopy={false} disabled={false} placeholder="currency"
                                    onChange={(e) => this.onChangeCurrency(e)}
                                    value={this.state.currency} />
                                <InputBox
                                    size="medium" useCopy={false} disabled={false} placeholder="amount"
                                    value={this.state.amount}
                                    onChange={(e) => this.onChangeAmount(e)} />
                                <SmallButton
                                    visible={true}
                                    disabled={!(this.state.currency && this.state.amount) ? true : false}
                                    onClick={() => this.addAmount()}>ADD</SmallButton>
                            </div>
                            <div className='tf-address-adder'>
                                <p>RECEIVER'S ADDRESS:</p>
                                <InputBox
                                    size="medium" useCopy={false} disabled={false} placeholder='target address'
                                    value={this.state.threshold}
                                    onChange={(e) => this.onChangeAddress(e)} />
                            </div>
                        </section>
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.amounts.length < 1 || this.state.address === "" ? true : false}
                    onClick={() => this.onClick()}>TRANSFER</ConfirmButton>

                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}
                    json={this.state.created}
                    filename={this.state.filename}
                    download={this.state.download}
                    operation='TRANSFER' />
            </div>
        );
    }
}
export default Transfer;