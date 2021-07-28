import React, { createRef } from 'react';
import './CreateAccount.scss';

import ConfirmButton from '../buttons/ConfirmButton';
import InputBox from '../InputBox';

import { Generator } from 'mitumc';
import { Redirect } from 'react-router-dom';
import SmallButton from '../buttons/SmallButton';
import OperationConfirm from '../modals/OperationConfirm';

import download from '../../lib/Url';

const balance = (amount) => {
    return (
        <li key={amount.currency}>
            <p className="currency">{amount.currency}</p>
            <p className="amount">{amount.amount}</p>
        </li>
    );
}

const key = (k) => {
    return (
        <li key={k}>
            <p className="key">{k.key}</p>
            <p className="weight">{k.weight}</p>
        </li>
    );
}

class CreateAccount extends React.Component {
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

            keys: [],
            amounts: [],
            threshold: "",

            publicKey: "",
            weight: "",
            currency: "",
            amount: "",

            created: undefined,
            newAddress: "",
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

            const created = createAccounts.dict();

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

        if (this.createdRef.current && (this.state.keys.length > 0 || this.state.amounts.length > 0)) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.titleRef.current) {
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
                    <p id="head">CURRENT BALANCE LIST</p>
                    <ul>
                        {account.balances ? account.balances.map(x => balance(x)) : false}
                    </ul>
                </div>
                <div className="ca-input-wrap">
                    <div ref={this.createdRef}></div>
                    <div className="ca-keys">
                        <p id="head">KEY LIST</p>
                        <div id="label">
                            <p className='key'>KEY</p>
                            <p className='weight'>WEIGHT</p>
                        </div>
                        <ul>
                            {this.state.keys.length > 0 ? this.state.keys.map(x => key(x)) : false}
                        </ul>
                        <section>
                            <div className="ca-key-adder">
                                <InputBox size="medium" useCopy={false} disabled={false} placeholder="public key"
                                    value={this.state.publicKey}
                                    style={{ marginRight: "0.5em" }}
                                    onChange={(e) => this.onChangePub(e)} />
                                <InputBox size="small" useCopy={false} disabled={false} placeholder="weight"
                                    value={this.state.weight}
                                    onChange={(e) => this.onChangeWeight(e)} />
                                <SmallButton
                                    visible={true}
                                    disabled={!(this.state.publicKey && this.state.weight) ? true : false}
                                    onClick={() => this.addKey()}>ADD</SmallButton>
                            </div>
                            <div className="ca-thres-adder">
                                <p>THRESHOLD:</p>
                                <InputBox
                                    size="small" useCopy={false} disabled={false} placeholder='threshold'
                                    value={this.state.threshold}
                                    onChange={(e) => this.onChangeThres(e)} />
                            </div>
                        </section>
                    </div>

                    <div className="ca-amounts">
                        <p id="head">AMOUNT LIST</p>
                        <div id="label">
                            <p className='currency'>CURRENCY ID</p>
                            <p className='amount'>AMOUNT</p>
                        </div>
                        <ul>
                            {this.state.amounts.length > 0 ? this.state.amounts.map(x => balance(x)) : false}
                        </ul>
                        <section>
                            <div className="ca-amount-adder">
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
                        </section>
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.amounts.length < 1 || this.state.keys.length < 1 || this.state.threshold === "" ? true : false}
                    onClick={() => this.onClick()}>CREATE</ConfirmButton>

                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}
                    json={this.state.created}
                    filename={this.state.filename}
                    download={this.state.download}
                    operation='CREATE-ACCOUNT' />
            </div>
        );
    }
}
export default CreateAccount;