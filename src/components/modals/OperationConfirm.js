import React from 'react';
import axios from 'axios';
import "./OperationConfirm.scss";
import { Redirect } from 'react-router-dom';

const broadcast = async (operation) => {
    if (!operation || !Object.prototype.hasOwnProperty.call(operation, 'hash') || !Object.prototype.hasOwnProperty.call(operation, 'memo')
        || !Object.prototype.hasOwnProperty.call(operation, 'fact') || !Object.prototype.hasOwnProperty.call(operation, 'fact_signs')
        || !operation.hash || !operation.fact || !operation.fact_signs) {
        return undefined;
    }

    return await axios.post(process.env.REACT_APP_API_BROADCAST, operation);
}

class OperationConfirm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRedirect: false,
            status: undefined,
            response: undefined
        }
    }

    onSend(json) {
        broadcast(json).then(
            res => {
                this.setState({
                    isRedirect: true,
                    status: res.request.status,
                    response: res.data
                });
            }
        ).catch(
            e => {
                this.setState({
                    isRedirect: true,
                    status: e.response.data.status,
                    response: e.response.data
                })
                alert('작업을 전송할 수 없습니다.\n네트워크를 확인해주세요.');
            }
        );
    }

    renderRedirect() {
        const { operation, json } = this.props;
        switch (this.props.operation) {
            case 'CREATE-ACCOUNT':
            case 'TRANSFER':
                return <Redirect to={{
                    pathname: '/response',
                    state: {
                        res: this.state.response,
                        status: this.state.status,
                        operation: operation,
                        data: operation === 'CREATE-ACCOUNT'
                            ? json.fact.items.map(x => x.keys.hash + ':mca-' + process.env.REACT_APP_VERSION)
                            : []
                    }
                }} />;
            case 'UPDATE-KEY':
                return <Redirect to={{
                    pathname: '/loading',
                    state: {
                        res: this.state.response,
                        status: this.state.status,
                        data: json.fact.hash
                    }
                }} />;
            default:
                alert('잘못된 작업입니다!\n지갑 페이지로 이동합니다.');
                return <Redirect to='/login'/>;
        }
    }

    render() {
        const { isOpen, onClose, json, filename, download } = this.props;
        return (
            <div className={isOpen ? 'openModal modal' : 'modal'}>
                {this.state.isRedirect ? this.renderRedirect() : false}
                {isOpen ? (
                    <section>
                        <header>
                            이 작업을 전송하겠습니까?
                            <button className="close" onClick={onClose}> &times; </button>
                        </header>
                        <main>
                            <p>전송 버튼을 누른 후에는 작업을 되돌릴 수 없습니다. 작업 내용이 정확한가요?</p>
                            <span>
                                <p className="modal-button" id="no" onClick={onClose}>{"취소!:("}</p>
                                <a className="modal-button" id="no" target="_blank" download={`${filename}.json`}
                                    href={download} rel="noreferrer">
                                    {"JSON 파일 다운로드!:["}
                                </a>
                                <p className="modal-button" id="yes" onClick={() => this.onSend(json)}>{"전송!:)"}</p>
                            </span>
                        </main>
                    </section>
                ) : null}
            </div>
        )
    }
}

export default OperationConfirm;