import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import './UpdateKey.scss';

import ConfirmButton from '../buttons/ConfirmButton';
import Keys from '../infos/Keys';

import KeyAdder from '../adders/KeyAdder';
import ExtraAdder from '../adders/ExtraAdder';

import OperationConfirm from '../modals/OperationConfirm';

import { Generator } from 'mitumc';

import { setOperation } from '../../store/actions';

import { OPER_UPDATE_KEY } from '../../text/mode';
import AlertModal from '../modals/AlertModal';
import { isCurrencyValid, isDuplicate, isPublicKeyValid, isThresholdValid, isWeightsValidToThres, isWeightValid } from '../../lib/Validation';

class UpdateKey extends React.Component {

    constructor(props) {
        super(props);

        if (!this.props.isLogin) {
            this.state = { isRedirect: true }
            return;
        }

        this.state = {
            isRedirect: false,

            keys: [],
            threshold: "",
            currency: "",

            publicKey: "",
            weight: "",

            created: undefined,
            isModalOpen: false,

            isAlertOpen: false,
            alertTitle: '',
            alertMsg: '',

            download: undefined,
            filename: ""
        }
    }

    openAlert(title, msg) {
        this.setState({
            isAlertOpen: true,
            alertTitle: title,
            alertMsg: msg,
        });
    }

    closeAlert() {
        this.setState({
            isAlertOpen: false,
        })
    }

    closeModal() {
        this.setState({ isModalOpen: false });
    }

    onClick() {
        if (!isCurrencyValid(this.state.currency.trim(), this.props.account.balances.map(x => x.currency))) {
            this.openAlert('작업을 생성할 수 없습니다 :(', '잘못된 currency id입니다.');
            return;
        }

        if (!isWeightsValidToThres(this.state.keys.map(x => x.weight), this.state.threshold.trim())) {
            this.openAlert('작업을 생성할 수 없습니다 :(', '모든 weight들의 합은 threshold 이상이어야 합니다.');
            return;
        }

        try {
            const generator = new Generator(this.props.networkId);

            const account = this.props.account;
            const keys = generator.createKeys(
                this.state.keys.map(x =>
                    generator.formatKey(x.key, parseInt(x.weight))),
                parseInt(this.state.threshold.trim())
            );

            const keyUpdaterFact = generator.createKeyUpdaterFact(
                account.address, this.state.currency.trim(), keys
            );

            const keyUpdater = generator.createOperation(keyUpdaterFact, "");
            keyUpdater.addSign(account.privateKey);

            const created = keyUpdater.dict();

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

        this.setState({
            keys: [...this.state.keys, {
                key: this.state.publicKey.trim(),
                weight: this.state.weight.trim()
            }],
            publicKey: "",
            weight: "",
        });
    }

    componentDidMount() {
        this.scrollToInput();
    }

    componentDidUpdate() {
        this.scrollToInput();
    }

    scrollToInput = () => {
        if (this.createdRef.current && this.state.keys.length > 0) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.titleRef.current) {
            this.titleRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    render() {
        const account = this.props.account;

        if (this.state.isRedirect) {
            return <Redirect to='/login' />
        }

        return (
            <div className="uk-container">
                <h1>UPDATE KEY</h1>
                <div className="uk-info-wrap">
                    <Keys title='CURRENT KEY LIST' keys={account.publicKeys} />
                </div>
                <div className="uk-input-wrap">
                    <div className="uk-keys">
                        <Keys title='NEW KEY LIST' keys={this.state.keys} />
                        <section className='uk-keys-adder'>
                            <KeyAdder
                                onKeyChange={(e) => this.onChangePub(e)}
                                onWeightChange={(e) => this.onChangeWeight(e)}
                                onAdd={() => this.addKey()}
                                isAddDisabled={!(this.state.publicKey && this.state.weight)}
                                pub={this.state.publicKey} weight={this.state.weight}
                                useThres={false} />
                            <ExtraAdder
                                onThresChange={(e) => this.onChangeThres(e)}
                                onCurrencyChange={(e) => this.onChangeCurrency(e)}
                                thres={this.state.threshold} currency={this.state.currency} />
                        </section>
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.keys.length < 1 || this.state.threshold === "" || this.state.currency === "" ? true : false}
                    onClick={() => this.onClick()}>UPDATE</ConfirmButton>
                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()} />
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    networkId: state.network.networkId,
});

const mapDispatchToProps = dispatch => ({
    setJson: (json) => dispatch(setOperation(OPER_UPDATE_KEY, json)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(UpdateKey));