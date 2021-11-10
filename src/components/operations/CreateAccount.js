import React from 'react';
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
import { isAmountValid, isCurrencyValid, isDuplicate, isInLimit, isPublicKeyValid, isThresholdValid, isWeightsValidToThres, isWeightValid } from '../../lib/Validation';
import AlertModal from '../modals/AlertModal';
import { parseAmount } from '../../lib/Parse';

class CreateAccount extends React.Component {
    constructor(props) {
        super(props);

        if (!this.props.isLogin) {
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
            isAlertOpen: false,
            alertTitle: '',
            alertMsg: ''
        }
    }

    openAlert(title, msg) {
        this.setState({
            isAlertOpen: true,
            alertTitle: title,
            alertMsg: msg
        })
    }

    closeAlert() {
        this.setState({
            isAlertOpen: false
        })
    }

    closeModal() {
        this.setState({ isModalOpen: false })
    }

    onClick() {
        if (!isWeightsValidToThres(this.state.keys.map(x => x.weight), this.state.threshold)) {
            this.openAlert('작업을 생성할 수 없습니다 :(', '모든 weight들의 합은 threshold 이상이어야 합니다.');
            return;
        }

        if (!isInLimit(this.state.keys, parseInt(process.env.REACT_APP_LIMIT_KEYS_IN_KEYS))) {
            this.openAlert('작업을 생성할 수 없습니다 :(', `키의 개수가 ${process.env.REACT_APP_LIMIT_KEYS_IN_KEYS}개를 초과하였습니다.`);
            return;
        }

        if (!isInLimit(this.state.amounts, parseInt(process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM))) {
            this.openAlert('작업을 생성할 수 없습니다 :(', `어마운트의 개수가 ${process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM}개를 초과하였습니다.`);
            return;
        }

        try {
            const generator = new Generator(this.props.networkId);
            const account = this.props.account;

            const keys = generator.createKeys(
                this.state.keys.map(x =>
                    generator.formatKey(x.key, parseInt(x.weight))),
                parseInt(this.state.threshold)
            );

            const amounts = generator.createAmounts(
                this.state.amounts.map(x =>
                    generator.formatAmount(x.amount, x.currency))
            );
            
            const createAccountsFact = generator.createCreateAccountsFact(
                account.address,
                [generator.createCreateAccountsItem(
                    keys, amounts
                )]
            );

            const createAccounts = generator.createOperation(createAccountsFact, "");
            createAccounts.addSign(this.props.priv);

            const created = createAccounts.dict();

            this.props.setJson(created);
            this.setState({ isModalOpen: true });
        }
        catch (e) {
            console.log(e);
            this.openAlert('작업을 생성할 수 없습니다 :(', '입력하신 작업 내용을 확인해 주세요.');
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
        if (!isThresholdValid(this.state.threshold.trim())) {
            this.openAlert('키를 추가할 수 없습니다 :(', '잘못된 threshold입니다. threshold를 먼저 입력해주세요. (0 < threshold <=100)');
            return;
        }

        if (!isPublicKeyValid(this.state.publicKey.trim())) {
            this.openAlert('키를 추가할 수 없습니다 :(', '잘못된 public key입니다.');
            return;
        }

        if (!isWeightValid(this.state.weight.trim())) {
            this.openAlert('키를 추가할 수 없습니다 :(', '잘못된 weight입니다.');
            return;
        }

        if (isDuplicate(this.state.publicKey.trim(), this.state.keys.map(x => x.key))) {
            this.openAlert('키를 추가할 수 없습니다 :(', '이미 리스트에 중복된 키가 존재합니다.');
            return;
        }

        if (!isInLimit(this.state.keys, parseInt(process.env.REACT_APP_LIMIT_KEYS_IN_KEYS) - 1)) {
            this.openAlert('키를 추가할 수 없습니다 :(', `키는 ${process.env.REACT_APP_LIMIT_KEYS_IN_KEYS}개까지 추가할 수 있습니다.`);
            return;
        }

        this.setState({
            keys: [...this.state.keys, {
                key: this.state.publicKey.trim(),
                weight: this.state.weight.trim()
            }],
            publicKey: "",
            weight: "",
        });
    }

    addAmount() {
        if (!isCurrencyValid(this.state.currency.trim(), this.props.account.balances.map(x => x.currency))) {
            this.openAlert('어마운트를 추가할 수 없습니다 :(', '잘못된 currency id입니다.');
            return;
        }

        if (!isAmountValid(this.state.amount.trim())) {
            this.openAlert('어마운트를 추가할 수 없습니다 :(', '잘못된 currency amount입니다.');
            return;
        }

        if (isDuplicate(this.state.currency.trim(), this.state.amounts.map(x => x.currency))) {
            this.openAlert('어마운트를 추가할 수 없습니다 :(', '이미 리스트에 중복된 currency id가 존재합니다.');
            return;
        }

        if (!isInLimit(this.state.amounts, parseInt(process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM) - 1)) {
            this.openAlert('어마운트를 추가할 수 없습니다 :(', `어마운트는 ${process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM}개까지 추가할 수 있습니다.`);
            return;
        }

        this.setState({
            amounts: [...this.state.amounts, {
                currency: this.state.currency.trim(),
                amount: parseAmount(this.state.amount.trim())
            }],
            currency: "",
            amount: ""
        });
    }

    render() {
        const account = this.props.account;

        if (this.state.isRedirect) {
            return <Redirect to='/login' />;
        }

        return (
            <div className="ca-container">
                <h1>CREATE ACCOUNT</h1>
                <div className="ca-balance-wrap">
                    <Balances title="CURRENT BALANCE LIST" labeled={false} balances={account.balances} />
                </div>
                <div className="ca-input-wrap">
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
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    networkId: state.network.networkId,
    isLogin: state.login.isLogin,
    account: state.login.account,
    priv: state.login.priv,
});

const mapDispatchToProps = dispatch => ({
    setJson: (json) => dispatch(setOperation(OPER_CREATE_ACCOUNT, json)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateAccount));