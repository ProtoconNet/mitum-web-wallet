import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { setResponse } from '../../store/actions';
import axios from 'axios';
import { Redirect, withRouter } from 'react-router-dom';

import QRCode from 'qrcode.react';
import "./OperationConfirm.scss";
import { isOperation } from '../../lib/Validation';

import { OPER_CREATE_ACCOUNT, OPER_UPDATE_KEY, OPER_TRANSFER } from '../../text/mode';
import hint from '../../text/hint.json';

import { encode } from 'base-64'

class OperationConfirm extends React.Component {

    constructor(props) {
        super(props);

        this.wrapperRef = createRef();

        this.state = {
            isRedirect: false,
            isExport: false,
        }
    }

    async broadcast(operation) {
        if (!isOperation(operation)) {
            return undefined;
        }

        return await axios.post(this.props.networkBroadcast, operation);
    }

    onSend(json) {
        this.broadcast(json).then(
            res => {
                if (res.request.status === 200) {
                    let data = undefined;
                    switch (this.props.operation) {
                        case OPER_CREATE_ACCOUNT:
                            data = json.fact.items.map(x => x.keys.hash + ':' + hint.address + '-' + process.env.REACT_APP_VERSION);
                            break;
                        case OPER_UPDATE_KEY:
                            data = json.fact.hash;
                            break;
                        case OPER_TRANSFER:
                        default:
                            data = undefined;
                    }
                    this.props.setResult(true, false, res.data, 200, data);
                }
                else {
                    this.props.setResult(false, false, res.data, res.request.status, undefined);
                }
                this.setState({ isRedirect: true });
            }
        ).catch(
            e => {

                try {
                    this.props.setResult(false, false, e.response.data, e.response.data.status, undefined);
                }
                catch (error) {
                    this.props.setResult(false, false, {
                        title: '404 Network Error'
                    }, 404, undefined);
                }
                this.setState({ isRedirect: true });
            }
        );
    }

    onExport() {
        this.setState({
            isExport: true
        });
    }

    downloadQr() {
        const { filename } = this.props;
        const canvas = document.getElementById("modal-qrcode");
        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${filename}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        this.onClose();
    }

    buttonView() {
        const { json, filename, download } = this.props;
        const target = encode(encode(JSON.stringify(json)));

        if (this.state.isExport) {
            if (target.length < 3000) {
                return (
                    <span>
                        <QRCode
                            style={{
                                display: "none"
                            }}
                            id="modal-qrcode"
                            value={target}
                            size={500}
                            level={"L"}
                            includeMargin={true}
                        />
                        <a className="oper-modal-button" id="yes" target="_blank" rel="noreferrer"
                            onClick={() => this.downloadQr()}>QR CODE</a>
                        <a className="oper-modal-button" id="yes" target="_blank" download={`${filename}.json`}
                            href={download} rel="noreferrer"
                            onClick={() => this.onClose()}>
                            JSON FILE
                        </a>
                    </span>
                )
            }
            else {
                return (
                    <span>
                        <a style={{ color: "gray", textDecoration: "line-through" }}
                            className="oper-modal-button" id="yes" target="_blank" rel="noreferrer"
                            onClick={() => alert("작업 용량이 너무 커 QR CODE를 생성할 수 없습니다.")}>QR CODE</a>
                        <a className="oper-modal-button" id="yes" target="_blank" download={`${filename}.json`}
                            href={download} rel="noreferrer"
                            onClick={() => this.onClose()}>
                            JSON FILE
                        </a>
                    </span>
                )
            }
        }
        else {
            return (
                <span>
                    <p className="oper-modal-button" id="no" onClick={() => this.onClose()}>{"취소!:("}</p>
                    <a className="oper-modal-button" id="no" onClick={() => this.onExport()}>{"내보내기 :["}</a>
                    <p className="oper-modal-button" id="yes" onClick={() => this.onSend(json)}>{"전송!:)"}</p>
                </span>
            )
        }
    }

    onClose() {
        const { onClose } = this.props;

        this.setState({
            isExport: false
        });
        onClose();
    }

    render() {
        const { isOpen } = this.props;

        if (this.state.isRedirect) {
            const { operation } = this.props;
            switch (operation) {
                case OPER_CREATE_ACCOUNT:
                case OPER_TRANSFER:
                    return <Redirect to='/response' />;
                case OPER_UPDATE_KEY:
                    return <Redirect to='/loading' />;
                default:
                    alert('처리할 수 없는 타입의 작업입니다 :(\n지갑 페이지로 이동합니다.');
                    return <Redirect to='/login' />;
            }
        }

        return (
            <div className={isOpen ? 'oper-openModal oper-modal' : 'oper-modal'}>
                {isOpen ? (
                    <section>
                        <header>
                            {
                                this.state.isExport
                                    ? "작업 파일 다운로드"
                                    : "이 작업을 전송하겠습니까?"
                            }
                            <button className="close" onClick={() => this.onClose()}> &times; </button>
                        </header>
                        <main>
                            {
                                this.state.isExport
                                    ? <p id='oper-exp'>파일 형식을 선택하세요.</p>
                                    : <p id='oper-exp'>전송 버튼을 누른 후에는 작업을 되돌릴 수 없습니다.<br />작업 내용이 정확한가요?</p>
                            }
                            {this.buttonView()}
                        </main>
                    </section>
                ) : null}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    operation: state.operation.operation,
    json: state.operation.json,
    download: state.operation.download,
    filename: state.operation.filename,
    data: state.operation.data,
    res: state.operation.res,
    status: state.operation.status,
    networkBroadcast: state.network.networkBroadcast
});

const mapDispatchToProps = dispatch => ({
    setResult: (isBroadcast, isStateIn, res, status, data) => dispatch(setResponse(isBroadcast, isStateIn, res, status, data)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(OperationConfirm));