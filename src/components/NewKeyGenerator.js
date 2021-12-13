import React from 'react';
import './NewKeyGenerator.scss';

import InputBox from '../components/InputBox';

import { getNewKeypair } from 'mitumc';
import ConfirmButton from './buttons/ConfirmButton';

class NewKeyGenerator extends React.Component {

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
                <h2>GET NEW KEYPAIR</h2>
                <div className="key-boxer">
                    <InputBox label="Private Key" disabled={true} useCopy={true} size="big" value={this.state.privKey} />
                    <InputBox label="Public Key" disabled={true} useCopy={true} size="big" value={this.state.pubKey} />
                </div>
                <div className="key-gen-button">
                    <ConfirmButton
                        disabled={false}
                        onClick={() => this.getKey()}>Get New Keypair</ConfirmButton>
                </div>
            </div>
        )
    }
}

export default NewKeyGenerator;