import React, { createRef } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import './Transfer.scss';

import InputBox from '../InputBox';
import AmountAdder from '../adders/AmountAdder';
import Balances from '../infos/Balances';
import ConfirmButton from '../buttons/ConfirmButton';

import OperationConfirm from '../modals/OperationConfirm';

import { Generator } from 'mitumc';

import { OPER_TRANSFER } from '../../text/mode';
import { setOperation } from '../../store/actions';


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

            this.props.setJson(created);
            this.setState({ isModalOpen: true });
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
                    <Balances title='CURRENT BALANCE LIST' labeled={false} balances={account.balances} />
                </div>
                <div className="tf-input-wrap">
                    <div ref={this.createdRef} />
                    <div className="tf-amounts">
                        <Balances title='AMOUNT LIST' labeled={true} balances={this.state.amounts} />
                        <AmountAdder
                            onCurrencyChange={(e) => this.onChangeCurrency(e)}
                            onAmountChange={(e) => this.onChangeAmount(e)}
                            currency={this.state.currency}
                            amount={this.state.amount}
                            isAddDisabled={!(this.state.currency && this.state.amount)}
                            onAdd={() => this.addAmount()} />
                        <div className='tf-address-adder'>
                            <p>RECEIVER'S ADDRESS:</p>
                            <InputBox
                                size="medium" useCopy={false} disabled={false} placeholder='target address'
                                value={this.state.threshold}
                                onChange={(e) => this.onChangeAddress(e)} />
                        </div>
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.amounts.length < 1 || this.state.address === "" ? true : false}
                    onClick={() => this.onClick()}>TRANSFER</ConfirmButton>

                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()} />
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setJson: (json) => dispatch(setOperation(OPER_TRANSFER, json)),
});

export default withRouter(connect(
    null,
    mapDispatchToProps
)(Transfer));