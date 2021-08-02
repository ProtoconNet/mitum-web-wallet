import React from 'react';
import { connect } from 'react-redux';
import { setResponse } from '../../store/actions';
import axios from 'axios';
import { Redirect, withRouter } from 'react-router-dom';

import "./OperationConfirm.scss";
import { isOperation } from '../../lib/Validation';

import { OPER_CREATE_ACCOUNT, OPER_UPDATE_KEY, OPER_TRANSFER } from '../../text/mode';
import hint from '../../text/hint.json';

const broadcast = async (operation) => {
    if (!isOperation(operation)) {
        return undefined;
    }

    return await axios.post(process.env.REACT_APP_API_BROADCAST, operation);
}

class OperationConfirm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRedirect: false,
        }
    }

    onSend(json) {
        broadcast(json).then(
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
                this.props.setResult(false, false, e.response.data, e.response.data.status, undefined);
                this.setState({ isRedirect: true });
                alert('작업을 전송할 수 없습니다.\n네트워크를 확인해주세요.');
            }
        );
    }

    renderRedirect() {
        const { operation } = this.props;
        switch (operation) {
            case OPER_CREATE_ACCOUNT:
            case OPER_TRANSFER:
                return <Redirect to='/response'/>;
            case OPER_UPDATE_KEY:
                return <Redirect to='/loading'/>;
            default:
                alert('잘못된 작업입니다!\n지갑 페이지로 이동합니다.');
                return <Redirect to='/login' />;
        }
    }

    render() {
        const { isOpen, onClose, json, filename, download } = this.props;
        return (
            <div className={isOpen ? 'oper-openModal oper-modal' : 'oper-modal'}>
                {this.state.isRedirect ? this.renderRedirect() : false}
                {isOpen ? (
                    <section>
                        <header>
                            이 작업을 전송하겠습니까?
                            <button className="close" onClick={onClose}> &times; </button>
                        </header>
                        <main>
                            <p id='oper-exp'>전송 버튼을 누른 후에는 작업을 되돌릴 수 없습니다.</p>
                            <p id='oper-exp'>작업 내용이 정확한가요?</p>
                            <span>
                                <p className="oper-modal-button" id="no" onClick={onClose}>{"취소!:("}</p>
                                <a className="oper-modal-button" id="no" target="_blank" download={`${filename}.json`}
                                    href={download} rel="noreferrer">
                                    {"JSON 파일 다운로드!:["}
                                </a>
                                <p className="oper-modal-button" id="yes" onClick={() => this.onSend(json)}>{"전송!:)"}</p>
                            </span>
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
});

const mapDispatchToProps = dispatch => ({
    setResult: (isBroadcast, isStateIn, res, status, data) => dispatch(setResponse(isBroadcast, isStateIn, res, status, data)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(OperationConfirm));