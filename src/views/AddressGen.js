import React from "react";
import './AddressGen.scss';

import Keys from "../components/infos/Keys";
import ThresholdAdder from "../components/adders/ThresholdAdder";
import KeyAdder from "../components/adders/KeyAdder";
import AlertModal from "../components/modals/AlertModal";

import { isDuplicate, isPublicKeyValid, isThresholdValid, isWeightsValidToThres, isWeightValid } from "../lib/Validation";

import { Generator } from 'mitumc';
import { withRouter } from "react-router";
import { connect } from "react-redux";

import copy from 'copy-to-clipboard';
import ConfirmButton from "../components/buttons/ConfirmButton";

const onCopy = (msg) => {
    copy(msg);
    alert("copied!");
}

class AddressGen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            keys: [],
            threshold: "",
            currency: "",

            publicKey: "",
            weight: "",

            isAlertOpen: false,
            alertTitle: '',
            alertMsg: '',

            address: ''
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
        if (!isThresholdValid(this.state.threshold.trim())) {
            this.openAlert('키를 추가할 수 없습니다 :(', '잘못된 threshold입니다. threshold를 먼저 입력해주세요. (0 < threshold <=100)');
            return;
        }

        if (!isPublicKeyValid(this.state.publicKey.trim())) {
            this.openAlert('키를 추가할 수 없습니다 :(', '잘못된 public key입니다.');
            return;
        }

        if (!isWeightValid(this.state.weight.trim())) {
            this.openAlert('키를 추가할 수 없습니다 :(', '잘못된 weight입니다.');
            return;
        }

        if (isDuplicate(this.state.publicKey.trim(), this.state.keys.map(x => x.key))) {
            this.openAlert('키를 추가할 수 없습니다 :(', '이미 리스트에 중복된 키가 존재합니다.');
            return;
        }

        this.setState({
            keys: [...this.state.keys, {
                key: this.state.publicKey.trim(),
                weight: this.state.weight.trim()
            }],
            publicKey: "",
            weight: "",
        });
    }

    getAddress() {
        if (!isWeightsValidToThres(this.state.keys.map(x => x.weight), this.state.threshold.trim())) {
            this.openAlert('계정 주소를 계산할 수 없습니다. :(', '모든 weight들의 합은 threshold 이상이어야 합니다.');
            return;
        }

        const generator = new Generator(this.props.networkId);
        const _keys = this.state.keys.map(k => generator.formatKey(k.key, parseInt(k.weight)));
        const keys = generator.createKeys(_keys, parseInt(this.state.threshold));

        this.setState({
            address: keys.address
        })
    }

    clear() {
        this.setState({
            keys: [],
            publicKey: "",
            weight: "",
            threshold: "",
            address: ""
        })
    }

    render() {
        return (
            <div className="address-gen-container">
                <h1>GET ADDRESS WITH KEYS</h1>
                <div className="address-gen-input-wrap">
                    <div ref={this.createdRef} />
                    <div className="address-gen-keys">
                        <Keys title='KEY LIST' keys={this.state.keys} />
                        <section className='address-keys-adder'>
                            <KeyAdder
                                onKeyChange={(e) => this.onChangePub(e)}
                                onWeightChange={(e) => this.onChangeWeight(e)}
                                onAdd={() => this.addKey()}
                                isAddDisabled={!(this.state.publicKey && this.state.weight)}
                                pub={this.state.publicKey} weight={this.state.weight}
                                useThres={false} />
                            <ThresholdAdder
                                onThresChange={(e) => this.onChangeThres(e)}
                                thres={this.state.threshold} />
                        </section>
                    </div>
                </div>
                <div className="address-gen-buttons">
                    <ConfirmButton
                        disabled={
                            this.state.keys.length !== 0 || this.state.address
                                || this.state.threshold || this.state.publicKey
                                || this.state.weight
                                ? false : true}
                        onClick={() => this.clear()}>CLEAR</ConfirmButton>
                    <ConfirmButton
                        disabled={this.state.keys.length < 1 || this.state.threshold === "" ? true : false}
                        onClick={() => this.getAddress()}>GET :D</ConfirmButton>
                </div>
                <div className="address-gen-account">
                    <p id="header">ADDRESS</p>
                    <p id="body" onClick={() => onCopy(this.state.address)}>{this.state.address ? this.state.address : "-"}</p>
                </div>
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    networkId: state.network.networkId,
});

export default withRouter(connect(
    mapStateToProps,
    null
)(AddressGen));