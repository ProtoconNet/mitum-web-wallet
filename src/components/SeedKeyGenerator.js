import React from 'react';
import './SeedKeyGenerator.scss';

import InputBox from '../components/InputBox';

import { getKeypairFromSeed } from 'mitumc';
import ConfirmButton from './buttons/ConfirmButton';

class SeedKeyGenerator extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            privKey: "",
            pubKey: "",

            seed: "",
        }
    }

    getKey() {
        if (this.state.seed.length < 36) {
            this.setState({
                privKey: "ERROR! SEED length < 36 :("
            });
        }

        const keypair = getKeypairFromSeed(this.state.seed);

        this.setState({
            privKey: keypair.getPrivateKey(),
            pubKey: keypair.getPublicKey()
        })
    }

    onSeedChange(e) {
        this.setState({
            seed: e.target.value
        })
    }

    render() {
        return (
            <div className="skey-gen-container">
                <h2>GET KEYPAIR FROM SEED</h2>
                <div className="seed-boxer">
                    <InputBox
                        onChange={(e) => this.onSeedChange(e)}
                        label="Private Key" disabled={false} useCopy={false} size="big" value={this.state.seed} />
                </div>
                <div className="skey-boxer">
                    <InputBox label="Private Key" disabled={true} useCopy={true} size="big" value={this.state.privKey} />
                    <InputBox label="Public Key" disabled={true} useCopy={true} size="big" value={this.state.pubKey} />
                </div>
                <div className="skey-gen-button">
                    <ConfirmButton
                        disabled={false}
                        onClick={() => this.getKey()}>Change seed to keypair</ConfirmButton>
                    <ConfirmButton
                        disabled={!(this.state.seed || this.state.priv)}
                        onClick={() => this.setState({
                            seed: "",
                            privKey: "",
                            pubKey: ""
                        })}>Clear</ConfirmButton>
                </div>
            </div>
        )
    }
}

export default SeedKeyGenerator;