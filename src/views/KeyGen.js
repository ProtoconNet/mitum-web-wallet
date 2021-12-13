import React from 'react';
import './KeyGen.scss';

import SelectButton from '../components/buttons/SelectButton';
import InputBox from '../components/InputBox';

import { getNewKeypair } from 'mitumc';

class KeyGen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            privKey: "",
            pubKey: "",
        }
    }

    getKey() {
        const keypair = getNewKeypair();

        this.setState({
            privKey: keypair.getPrivateKey(),
            pubKey: keypair.getPublicKey()
        })
    }

    render() {
        return (
            <div className="key-gen-container">
                <div className="key-selector">
                    <SelectButton onClick={() => this.getKey()}>BTC</SelectButton>
                    <SelectButton onClick={() => this.getKey()}>ETHER</SelectButton>
                    <SelectButton onClick={() => this.getKey()}>STELLAR</SelectButton>
                </div>
                <div className="key-boxer">
                    <InputBox label="Private Key" disabled={true} useCopy={true} size="big" value={this.state.privKey} />
                    <InputBox label="Public Key" disabled={true} useCopy={true} size="big" value={this.state.pubKey} />
                </div>
            </div>
        )
    }
}

export default KeyGen;