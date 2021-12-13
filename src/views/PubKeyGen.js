import React from 'react';
import ConfirmButton from '../components/buttons/ConfirmButton';
import InputBox from '../components/InputBox';
import './PubKeyGen.scss';

import { getKeypairFromPrivateKey } from 'mitumc';
import AlertModal from '../components/modals/AlertModal';
import { isPrivateKeyValidWithNotType } from '../lib/Validation';

class PubKeyGen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            privKey: "",
            pubKey: "",
            privKeyGen: "",

            isAlertOpen: false,
            alertTitle: "",
            alertMsg: "",
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

    onChangePrivate(e) {
        this.setState({
            privKey: e.target.value
        });
    }

    clear() {
        this.setState({
            privKey: "",
            pubKey: "",
            privKeyGen: "",
        });
    }

    getPubKey() {

        try {
            const keypair = getKeypairFromPrivateKey(this.state.privKey.trim() + "mpr");
            this.setState({
                pubKey: keypair.getPublicKey(),
                privKeyGen: keypair.getPrivateKey()
            });
        }
        catch (e) {
            this.openAlert("공개키를 계산할 수 없습니다. :(", "잘못된 개인키입니다.");
        }
    }

    render() {
        return (
            <div className="pubkey-gen-container">
                <h1>GET PUBLIC KEY</h1>
                <div className="pubkey-gen-input-wrap">
                    <div id="clear-button">
                        <p onClick={() => this.clear()}>CLEAR</p>
                    </div>
                    <InputBox disabled={false} useCopy={false} size="big"
                        onChange={(e) => { this.onChangePrivate(e) }}
                        value={this.state.privKey}
                        placeholder="enter private key..." />
                    <InputBox disabled={true} useCopy={true} size="big"
                        value={this.state.privKeyGen}
                        placeholder="private key" />
                    <InputBox disabled={true} useCopy={true} size="big"
                        value={this.state.pubKey}
                        placeholder="public key" />
                </div>
                <div className="pubkey-gen-buttons">
                    <span id="key-selector">
                        <ConfirmButton
                            disabled={isPrivateKeyValidWithNotType(this.state.privKey.trim()) ? false : true}
                            onClick={() => this.getPubKey()}>GET KEYPAIR</ConfirmButton>
                    </span>
                </div>
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        )
    }
}

export default PubKeyGen;