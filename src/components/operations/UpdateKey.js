import React, { createRef } from 'react';
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

class UpdateKey extends React.Component {

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
            threshold: "",
            currency: "",

            publicKey: "",
            weight: "",

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
            const keys = generator.createKeys(
                this.state.keys.map(x =>
                    generator.formatKey(x.key, parseInt(x.weight))),
                parseInt(this.state.threshold)
            );

            const keyUpdaterFact = generator.createKeyUpdaterFact(
                account.address, this.state.currency, keys
            );

            const keyUpdater = generator.createOperation(keyUpdaterFact, "");
            keyUpdater.addSign(account.privateKey);

            const created = keyUpdater.dict();
            
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
        this.setState({
            keys: [...this.state.keys, {
                key: this.state.publicKey,
                weight: this.state.weight
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
        return (
            <div className="uk-container">
                {this.state.isRedirect ? <Redirect to='/login' /> : false}
                <div ref={this.titleRef}></div>
                <h1>UPDATE KEY</h1>
                <div className="uk-info-wrap">
                    <Keys title='CURRENT KEY LIST' keys={account.publicKeys} />
                </div>
                <div className="uk-input-wrap">
                    <div ref={this.createdRef} />
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
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setJson: (json) => dispatch(setOperation(OPER_UPDATE_KEY, json)),
});

export default withRouter(connect(
    null,
    mapDispatchToProps
)(UpdateKey));