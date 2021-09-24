import React from 'react';
import './KeyGen.scss';

import SelectButton from '../components/buttons/SelectButton';
import InputBox from '../components/InputBox';

import { getKeypair } from 'mitumc';


const KEY_BTC = "btc";
const KEY_ETHER = "ether";
const KEY_STELLAR = "stellar";

class KeyGen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            privKey: "",
            pubKey: "",
        }
    }

    getKey(_type) {
        const keypair = getKeypair(_type);

        this.setState({
            privKey: keypair.getPrivateKey(),
            pubKey: keypair.getPublicKey()
        })
    }

    render() {
        return (
            <div className="key-gen-container">
                <div className="key-selector">
                    <SelectButton onClick={() => this.getKey(KEY_BTC)}>BTC</SelectButton>
                    <SelectButton onClick={() => this.getKey(KEY_ETHER)}>ETHER</SelectButton>
                    <SelectButton onClick={() => this.getKey(KEY_STELLAR)}>STELLAR</SelectButton>
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