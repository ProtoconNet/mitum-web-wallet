import React, { createRef } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { setOperation } from '../../store/actions';

import './CreateAccount.scss';

import ConfirmButton from '../buttons/ConfirmButton';

import OperationConfirm from '../modals/OperationConfirm';

import Keys from '../infos/Keys';
import Balances from '../infos/Balances';

import KeyAdder from '../adders/KeyAdder';
import AmountAdder from '../adders/AmountAdder';

import { Generator } from 'mitumc';

import { OPER_CREATE_ACCOUNT } from '../../text/mode';

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

            isModalOpen: false,
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

            this.props.setJson(created);
            this.setState({ isModalOpen: true });
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
                    <Balances title="CURRENT BALANCE LIST" labeled={false} balances={account.balances} />
                </div>
                <div className="ca-input-wrap">
                    <div ref={this.createdRef}></div>
                    <div className="ca-keys">
                        <Keys title='KEY LIST' keys={this.state.keys} labeled={true} />
                        <KeyAdder
                            onKeyChange={(e) => this.onChangePub(e)}
                            onWeightChange={(e) => this.onChangeWeight(e)}
                            onThresChange={(e) => this.onChangeThres(e)}
                            onAdd={() => this.addKey()}
                            isAddDisabled={!(this.state.publicKey && this.state.weight)}
                            pub={this.state.publicKey} weight={this.state.weight} thres={this.state.threshold}
                            useThres={true} />
                    </div>

                    <div className="ca-amounts">
                        <Balances title="AMOUNT LIST" balances={this.state.amounts} labeled={true} />
                        <AmountAdder
                            onCurrencyChange={(e) => this.onChangeCurrency(e)}
                            onAmountChange={(e) => this.onChangeAmount(e)}
                            currency={this.state.currency}
                            amount={this.state.amount}
                            isAddDisabled={!(this.state.currency && this.state.amount)}
                            onAdd={() => this.addAmount()} />
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.amounts.length < 1 || this.state.keys.length < 1 || this.state.threshold === "" ? true : false}
                    onClick={() => this.onClick()}>CREATE</ConfirmButton>

                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()} />
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setJson: (json) => dispatch(setOperation(OPER_CREATE_ACCOUNT, json)),
});

export default withRouter(connect(
    null,
    mapDispatchToProps
)(CreateAccount));