import React from 'react';
import './KeyGen.scss';

import SelectButton from '../components/buttons/SelectButton';
import InputBox from '../components/InputBox';

import { version, key } from "../text/hint.json";

import { getKeypair } from 'mitumc';


const KEY_BTC = "btc";
const KEY_ETHER = "ether";
const KEY_STELLAR = "stellar";

class KeyGen extends React.Component {
    state = {
        privKey: "",
        pubKey: "",
    }

    getKey(_type) {
        const keypair = getKeypair(_type);

        let privateKey = keypair.privKey.key + ':';
        let publicKey = keypair.pubKey + ':';

        switch (_type) {
            case KEY_BTC:
                privateKey += key.btc.priv;
                publicKey += key.btc.pub;
                break;
            case KEY_ETHER:
                privateKey += key.ether.priv;
                publicKey += key.ether.pub;
                break;
            case KEY_STELLAR:
                privateKey += key.stellar.priv;
                publicKey += key.stellar.pub;
                break;
            default: throw new Error("Invalid key type");
        }

        privateKey += '-' + version;
        publicKey += '-' + version;

        this.setState({
            privKey: privateKey,
            pubKey: publicKey
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