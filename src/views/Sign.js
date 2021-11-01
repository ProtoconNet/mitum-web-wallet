import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { clearPage, setOperation } from '../store/actions';
import copy from 'copy-to-clipboard';

import './Sign.scss';

import ConfirmButton from '../components/buttons/ConfirmButton';

import { Signer } from 'mitumc';

import OperationConfirm from '../components/modals/OperationConfirm';

import { PAGE_QR } from '../text/mode';
import { isDuplicate, isItemsInLimit, isOperation } from '../lib/Validation';
import { OPER_DEFAULT } from '../text/mode';
import AlertModal from '../components/modals/AlertModal';
import SmallButton from '../components/buttons/SmallButton';
import { getOperationFromType } from '../lib/Parse';

const onCopy = (msg) => {
    copy(msg);
    alert('copied!');
}

const preStyle = {
    display: 'block',
    padding: '10px 30px',
    margin: '0',
    overflow: 'visible',
    whiteSpace: "pre-wrap"
}



class Sign extends React.Component {

    constructor(props) {
        super(props);

        if (this.props.pageBefore !== PAGE_QR) {
            this.props.setJson(OPER_DEFAULT, null);
        }
        this.props.clearPage();

        this.state = {
            isRedirect: false,

            isModalOpen: false,
            isJsonOpen: false,

            isAlertOpen: false,
            alertTitle: '',
            alertMsg: '',

            toQr: false,
        }
    }

    toQrPage() {
        this.setState({
            toQr: true
        })
    }

    openAlert(title, msg) {
        this.setState({
            isAlertOpen: true,
            alertTitle: title,
            alertMsg: msg
        })
    }

    closeAlert() {
        this.setState({
            isAlertOpen: false,
        })
    }

    closeModal() {
        this.setState({ isModalOpen: false })
    }

    jsonView() {
        return (
            <div className="sign-json">
                {!(this.props.operation === OPER_DEFAULT)
                    ? (
                        <pre style={preStyle}
                            onClick={() => onCopy(JSON.stringify(this.props.json, null, 4))}>
                            {JSON.stringify(this.props.json, null, 4)}
                        </pre>
                    ) : false}
            </div>
        );
    }

    importJSON(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const json = this.props.json;
            try {
                const parsed = JSON.parse(reader.result);
                if (!isOperation(parsed)) {
                    this.openAlert('파일을 불러올 수 없습니다 :(', '[memo, hash, _hint, fact, fact_signs]를 포함한 JSON 파일을 사용해 주세요.');
                }
                else if (!isItemsInLimit(parsed)) {
                    this.openAlert('파일을 불러올 수 없습니다 :(', '작업 파일의 아이템, 키, 혹은 어마운트의 수가 정책 기준을 초과합니다.');
                }
                else {
                    const operation = getOperationFromType(parsed._hint);
                    this.props.setJson(operation, parsed);
                }
            }
            catch (e) {
                if (json) {
                    const operation = getOperationFromType(json._hint);
                    this.props.setJson(operation, json);
                }
                this.openAlert('파일을 불러올 수 없습니다 :(', 'JSON 형식의 파일을 사용해 주세요.');
            }
        };
        reader.readAsText(file, "utf-8");

    }

    onClickSend() {
        this.setState({
            isModalOpen: true
        })
    }

    onClickSign() {
        let target = this.props.json;

        if (!isOperation(target)) {
            this.openAlert('서명 추가 실패 :(', '잘못된 작업 파일입니다.');
            return;
        }

        if (!isItemsInLimit(target)) {
            this.openAlert('서명 추가 실패 :(', '작업 파일의 아이템, 키, 혹은 어마운트의 수가 정책 기준을 초과합니다.');
            return;
        }

        if (this.props.account.address !== this.props.json.fact.sender) {
            this.openAlert('서명 추가 실패 :(', '이 계정에서 생성된 작업이 아닙니다.');
            return;
        }

        if (isDuplicate(this.props.account.publicKey, this.props.json.fact_signs.map(x => x.signer))) {
            this.openAlert('서명 추가 실패 :(', '이미 서명 된 작업입니다.');
            return;
        }

        const signer = new Signer(this.props.networkId, this.props.account.privateKey);

        try {
            const json = signer.signOperation(target);
            const operation = getOperationFromType(json._hint);

            this.props.setJson(operation, json);
            this.openAlert('서명 추가 완료 :D', '작업에 서명을 추가하였습니다.');
        }
        catch (e) {
            const operation = getOperationFromType(target._hint);
            this.props.setJson(operation, target);
            this.openAlert('서명 추가 실패 :(', '서명을 추가하는 도중 오류가 발생하였습니다.');
        }
    }

    openJSON() {
        this.setState({
            isJsonOpen: !this.state.isJsonOpen
        })
    }

    render() {

        if (this.state.toQr) {
            return <Redirect to='/qr-reader' />;
        }

        if (this.state.isRedirect) {
            return <Redirect to='/login' />;
        }

        return (
            <div className="sign-container">
                <h1>SIGN / SEND OPERATION</h1>
                <div className="sign-operation">
                    <div className="sign-info">
                        <span id="other">
                            <p id="head">FACT HASH</p>
                            <p id="body">
                                {
                                    this.props.json && Object.prototype.hasOwnProperty.call(this.props.json, 'fact')
                                        ? this.props.json.fact.hash
                                        : "NONE"
                                }
                            </p>
                        </span>
                        <span id="other">
                            <p id="head">TYPE</p>
                            <p id="body">{this.props.json ? this.props.json._hint : 'NONE'}</p>
                        </span>
                        <span id="sig">
                            <p id="head">SIGNATURES</p>
                            <p id='body'>{this.props.json ? (
                                this.props.json.fact_signs.map(x => x).length !== 0
                                    ? (
                                        this.props.json.fact_signs.map(x => x).length === 1
                                            ? `${this.props.json.fact_signs.map(x => x).length} signature`
                                            : `${this.props.json.fact_signs.map(x => x).length} signatures`
                                    )
                                    : 'No signature'
                            ) : 'No signature'}</p>
                        </span>
                    </div>
                    {this.props.json
                        ? (
                            <div className='sign-view-json'
                                onClick={() => this.openJSON()}>
                                <p>{this.state.isJsonOpen ? "CLOSE" : "VIEW JSON"}</p>
                            </div>
                        ) : false}
                    {this.state.isJsonOpen ? this.jsonView() : false}
                    <div className="sign-files">
                        <input type="file" onChange={(e) => this.importJSON(e)} />
                        <SmallButton
                            visible={true}
                            disabled={false}
                            onClick={() => this.toQrPage()}>import from qr code</SmallButton>
                    </div>
                </div>
                <div className="sign-buttons">
                    <ConfirmButton disabled={this.props.operation === OPER_DEFAULT} onClick={() => this.onClickSend()}>SEND</ConfirmButton>
                    <ConfirmButton disabled={this.props.operation === OPER_DEFAULT} onClick={() => this.onClickSign()}>SIGN</ConfirmButton>
                </div>
                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()} />
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,

    operation: state.operation.operation,
    json: state.operation.json,

    networkId: state.network.networkId,

    pageBefore: state.page.pageBefore,
});

const mapDispatchToProps = dispatch => ({
    setJson: (operation, json) => dispatch(setOperation(operation, json)),
    clearPage: () => dispatch(clearPage()),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Sign));