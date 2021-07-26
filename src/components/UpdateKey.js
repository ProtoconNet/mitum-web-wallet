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
            <span className="currency">{amount.currency}</span>
            <span className="amount">{amount.amount}</span>
        </li>
    );
}

const key = (k) => {
    return (
        <li key={k}>
            <span className="key">{k.key}</span>
            <span className="weight">{k.weight}</span>
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
        const labelStyle={
            textAlign: 'center'
        };
        const lineStyle={
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
            <div className="uk-container">
                {this.state.isRedirect ? <Redirect to='/login' /> : false}
                <div ref={this.titleRef}></div>
                <h1>UPDATE KEY</h1>
                <div className="uk-address-wrap">
                    <h2>{account.address}</h2>
                    <ul>
                        {account.publicKeys ? account.publicKeys.map(x => key(x)) : false}
                    </ul>
                </div>
                <div className="uk-amount-wrap">
                    <h2>BALANCE</h2>
                    <ul>{account.balances ? account.balances.map(x => balance(x)) : false}</ul>
                </div>
                <div ref={this.createdRef}></div>
                <div className="uk-input-wrap">
                    <div className="uk-keys">
                        <h2>NEW KEYS</h2>
                        <div className="uk-keys-extra-input">
                            <InputBox
                                size="small" useCopy={false} disabled={false} placeholder='threshold'
                                value={this.state.threshold}
                                onChange={(e) => this.onChangeThres(e)} />
                            <InputBox
                                size="small" useCopy={false} disabled={false} placeholder='currency'
                                value={this.state.currency}
                                onChange={(e) => this.onChangeCurrency(e)} />
                        </div>

                        <ul>
                            <li>
                                <span style={labelStyle} className='key'>KEY</span>
                                <span style={labelStyle} className='weight'>WEIGHT</span>
                            </li>
                            <li>
                                <span style={lineStyle}></span>
                                <span style={lineStyle}></span>
                            </li>
                            {this.state.keys.length < 1
                                ? (
                                    <li style={emptyliStyle} >
                                        <span style={emptyStyle} className='key'>-</span>
                                        <span style={emptyStyle} className='weight'>-</span>
                                    </li>
                                ) : false}
                            {this.state.keys.length > 0 ? this.state.keys.map(x => key(x)) : false}
                        </ul>
                        <span className="uk-key-adder">
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
                    download={this.state.download}/>
            </div>
        );
    }
}
export default UpdateKey;