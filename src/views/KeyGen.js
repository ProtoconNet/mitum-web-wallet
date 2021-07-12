import React from 'react';
import './KeyGen.scss';

import SelectButton from '../components/buttons/SelectButton';
import InputBox from '../components/InputBox';

import {version, key} from "../text/hint.json";

import {getKeypair} from 'mitumc';

class KeyGen extends React.Component {
    state = {
        privKey: "",
        pubKey: "",
    }

    getKey(_type) {
        const keypair = getKeypair(_type);

        let privateKey = keypair.privKey.key + ':';
        let publicKey = keypair.pubKey + ':';
        
        switch(_type) {
            case "btc":
                privateKey += key.btc.priv;
                publicKey += key.btc.pub;
                break;
            case "ether":
                privateKey += key.ether.priv;
                publicKey += key.ether.pub;
                break;
            case "stellar":
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
                    <SelectButton onClick={() => this.getKey('btc')} size="big">BTC</SelectButton>
                    <SelectButton onClick={() => this.getKey('ether')} size="big">ETHER</SelectButton>
                    <SelectButton onClick={() => this.getKey('stellar')} size="big">STELLAR</SelectButton>
                </div>
                <div className="key-boxer">
                    <InputBox disabled={true} useCopy={true} size="big" value={this.state.privKey}/>
                    <InputBox disabled={true} useCopy={true} size="big" value={this.state.pubKey}/>
                </div>
            </div>
        )
    }
}

export default KeyGen;