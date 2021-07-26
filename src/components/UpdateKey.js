import React, { createRef } from 'react';
import './UpdateKey.scss';

import InputBox from './InputBox';
import ConfirmButton from './buttons/ConfirmButton';

import { Generator } from 'mitumc';
import { Redirect } from 'react-router-dom';
import SmallButton from './buttons/SmallButton';
import OperationConfirm from './modals/OperationConfirm';

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

        this.setState({
            created: created,
            isModalOpen: true,
            download: download(created),
            filename: created.hash
        });
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
        if (this.createdRef.current && !this.state.created && this.state.keys.length > 0) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.titleRef.current && !this.state.created) {
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
                    <div id="address">
                        <p id="head">ADDRESS</p>
                        <p id="body">{account.address}</p>
                    </div>
                    <div id="pub">
                        <p>CURRENT PUBLIC KEYS</p>
                        <ul>
                            {account.publicKeys ? account.publicKeys.map(x => key(x)) : false}
                        </ul>
                    </div>
                    <div id="balance">
                        <p>CURRENT BALANCES</p>
                        <ul>
                            {account.balances ? account.balances.map(x => balance(x)) : false}
                        </ul>
                    </div>
                </div>
                <div className="uk-input-wrap">
                    <p>Fill the below section with new keys. Additionally, You must give currency ID for paying fees. This page is for updating keys of the account.</p>
                    <div ref={this.createdRef} />
                    <div className="uk-keys">
                        <p id="head">NEW KEYS</p>
                        <p id="exp">
                            You need at least one pair of mitum-style public key and weight value. The total weight of all weights must be equal to or more than threshold.
                            Old keys will be replaced with new keys but there isn't any change with your account address.
                        </p>
                        <div id="label">
                            <p className='key'>KEY</p>
                            <p className='weight'>WEIGHT</p>
                        </div>
                        <ul>
                            {this.state.keys.length < 1
                                ? (
                                    <li key="empty" >
                                        <p className='key'>-</p>
                                        <p className='weight'>-</p>
                                    </li>
                                ) : false}
                            {this.state.keys.length > 0 ? this.state.keys.map(x => key(x)) : false}
                        </ul>
                        <div id="thres">
                            <p id="head">THRESHOLD</p>
                            <p id="body">{this.state.threshold ? this.state.threshold : "-"}</p>
                        </div>
                        <div id="currency">
                            <p id="head">CURRENCY ID</p>
                            <p id="body">{this.state.currency ? this.state.currency : "-"}</p>
                        </div>
                    </div>

                    <div className="uk-adder">
                        <span className="uk-currency-adder">
                            <p>CURRENCY ID:</p>
                            <InputBox
                                size="small" useCopy={false} disabled={false} placeholder='currency'
                                value={this.state.currency}
                                onChange={(e) => this.onChangeCurrency(e)} />
                        </span>
                        <span className="uk-thres-adder">
                            <p>THRESHOLD  :</p>
                            <InputBox
                                size="small" useCopy={false} disabled={false} placeholder='threshold'
                                value={this.state.threshold}
                                onChange={(e) => this.onChangeThres(e)} />
                        </span>
                        <span className="uk-key-adder">
                            <p>ADD KEY</p>
                            <div id="adder">
                                <InputBox size="medium" useCopy={false} disabled={false} placeholder="public key"
                                    value={this.state.publicKey}
                                    onChange={(e) => this.onChangePub(e)} />
                                <InputBox size="small" useCopy={false} disabled={false} placeholder="weight"
                                    value={this.state.weight}
                                    onChange={(e) => this.onChangeWeight(e)} />
                                <SmallButton
                                    visible={true}
                                    disabled={!(this.state.publicKey && this.state.weight) ? true : false}
                                    onClick={() => this.addKey()}>ADD</SmallButton>
                            </div>
                        </span>
                    </div>
                </div>
                <ConfirmButton
                    disabled={this.state.keys.length < 1 || this.state.threshold === "" || this.state.currency === "" ? true : false}
                    onClick={() => this.onClick()}>UPDATE</ConfirmButton>
                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}
                    title="Are you sure?"
                    json={this.state.created}
                    filename={this.state.filename}
                    download={this.state.download} />
            </div>
        );
    }
}
export default UpdateKey;