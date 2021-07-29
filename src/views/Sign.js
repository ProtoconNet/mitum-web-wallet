import React, { createRef } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { setOperation } from '../store/actions';
import copy from 'copy-to-clipboard';

import './Sign.scss';

import ConfirmButton from '../components/buttons/ConfirmButton';

import { Signer } from 'mitumc';

import OperationConfirm from '../components/modals/OperationConfirm';

import { operation } from '../text/hint.json';
import { isOperation, isStateValid } from '../lib/Validation';
import { OPER_CREATE_ACCOUNT, OPER_DEFAULT, OPER_TRANSFER, OPER_UPDATE_KEY } from '../text/mode';

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

const sig = (x) => {
    return (
        <li key={x}>{x}</li>
    );
}

const TYPE_CREATE_ACCOUNT = operation.create_account + '-' + process.env.REACT_APP_VERSION;
const TYPE_UPDATE_KEY = operation.update_key + '-' + process.env.REACT_APP_VERSION;
const TYPE_TRANSFER = operation.transfer + '-' + process.env.REACT_APP_VERSION;

const getOperationFromType = (type) => {
    switch (type) {
        case TYPE_CREATE_ACCOUNT:
            return OPER_CREATE_ACCOUNT;
        case TYPE_UPDATE_KEY:
            return OPER_UPDATE_KEY;
        case TYPE_TRANSFER:
            return OPER_TRANSFER;
        default:
            return OPER_DEFAULT;
    }
}

class Sign extends React.Component {

    constructor(props) {
        super(props);

        this.createdRef = createRef();
        this.infoRef = createRef();
        this.jsonRef = createRef();

        if (!isStateValid(this.props) || !this.props.isLogin) {
            this.state = {
                isRedirect: true
            }
            return;
        }

        this.props.setJson(OPER_DEFAULT, {});

        this.state = {
            isRedirect: false,
            type: "",
            sigs: [],

            isModalOpen: false,
            isJsonOpen: false
        }
    }

    closeModal() {
        this.setState({ isModalOpen: false })
    }

    componentDidMount() {
        this.scrollToJSON();
    }

    componentDidUpdate() {
        this.scrollToJSON();
    }

    scrollToJSON = () => {
        if (this.jsonRef.current && this.state.isJsonOpen) {
            this.jsonRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.infoRef.current && this.state.json && !this.state.isJsonOpen) {
            this.infoRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.createdRef.current) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
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
        const json = this.props.json;

        try {
            reader.onload = () => {
                const parsed = JSON.parse(reader.result);
                if (!isOperation(parsed)) {
                    alert('유효하지 않은 작업 파일입니다.');
                }
                else {
                    const operation = getOperationFromType(parsed._hint);
                    this.props.setJson(operation, parsed);
                    this.setState({
                        type: parsed._hint,
                        sigs: parsed.fact_signs.map(x => x.signature),
                    })
                }
            };
            reader.readAsText(file, "utf-8");
        } catch (e) {
            const operation = getOperationFromType(json._hint);

            this.props.setJson(operation, json);
            this.setState({
                type: json ? json._hint : "",
                sigs: json && Object.prototype.hasOwnProperty.call(json, 'fact_signs') ? json.fact_signs.map(x => x.signature) : []
            });
            alert('유효하지 않은 작업파일 입니다.');
        }
    }

    onClickSend() {
        this.setState({
            isModalOpen: true
        })
    }

    onClickSign() {
        let target = this.props.json;

        if (!isOperation(target)) {
            return;
        }

        const signer = new Signer(process.env.REACT_APP_NETWORK_ID, this.props.account.privateKey);

        try {
            const json = signer.signOperation(target);
            const operation = getOperationFromType(json._hint);

            this.props.setJson(operation, json);
            this.setState({
                type: json._hint,
                sigs: json.fact_signs.map(x => x.signature)
            });
            alert('성공! :D');
        }
        catch (e) {
            const operation = getOperationFromType(target._hint);
            this.props.setJson(operation, target);

            this.setState({
                type: Object.prototype.hasOwnProperty.call(target, '_hint') ? target._hint : "",
                sigs: target.fact_signs.map(x => x.signature)
            })
            alert('작업에 서명을 추가할 수 없습니다. :(');
        }
    }

    openJSON() {
        this.setState({
            isJsonOpen: !this.state.isJsonOpen
        })
    }

    render() {
        return (
            <div className="sign-container">
                {this.state.isRedirect ? <Redirect to='/login' /> : false}
                <div ref={this.createdRef} />
                <h1>SIGN / SEND OPERATION</h1>
                <div ref={this.infoRef} />
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
                            <p id="body">{this.state.type ? this.state.type : "NONE"}</p>
                        </span>
                        <span id="sig">
                            <p id="head">SIGNATURES</p>
                            <ul>
                                {this.state.sigs.length > 0
                                    ? this.state.sigs.map(x => sig(x))
                                    : (
                                        <li style={{ textAlign: "center" }}>-</li>
                                    )
                                }
                            </ul>
                        </span>
                    </div>
                    <div ref={this.jsonRef} />
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
                    </div>
                </div>
                <div className="sign-buttons">
                    <ConfirmButton disabled={this.props.operation === OPER_DEFAULT} onClick={() => this.onClickSend()}>SEND</ConfirmButton>
                    <ConfirmButton disabled={this.props.operation === OPER_DEFAULT} onClick={() => this.onClickSign()}>SIGN</ConfirmButton>
                </div>
                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account,

    operation: state.operation.operation,
    json: state.operation.json,
});

const mapDispatchToProps = dispatch => ({
    setJson: (operation, json) => dispatch(setOperation(operation, json)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Sign));