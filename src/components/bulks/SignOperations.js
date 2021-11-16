import { Signer } from 'mitumc';
import React, { Component } from 'react';
import ReactFileReader from 'react-file-reader';
import { connect } from 'react-redux';
import { isOperation } from '../../lib/Validation';
import { clearBulks, setSignedOperation, setUnsignedOperation } from '../../store/actions';
import { afterLoad, beforeLoad, loadingOperation, signDone, stopSigning, signingOperation } from '../../store/reducers/BulkReducer';
import CompleteJob from './CompleteJob';
import './SignOperations.scss';

var running = true;

class SignOperations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loadingPercentage: this.props.unsigned.length,
            loadingCurrent: this.props.signed.length,

            unsigned: [...this.props.unsigned],
            signed: [...this.props.signed],

            currentState: this.props.unsigned.length > 0
                ? (this.props.unsigned.length === this.props.signed.length ? signDone : stopSigning)
                : beforeLoad,
            showRule: false,
            currOperation: ""
        }
        this.readFile = this.readFile.bind(this);
    }

    componentWillUnmount() {
        if (this.props.unsigned.length < 1) {
            this.props.clearBulks();
        }
        else {
            this.props.setSigned(this.state.signed);
        }
    }

    readFile(files) {
        var reader = new FileReader();
        reader.onload = (e) => {
            const lines = reader.result.split('\n');
            const len = lines.length;

            var _lines = lines;
            if (lines[len - 1] === "") {
                _lines = lines.splice(0, len - 1);
            }

            this.setState({
                unsigned: _lines,
                loadingPercentage: _lines.length,
                loadingCurrent: 0,
            });
            this.setLines();
        }
        reader.readAsText(files[0]);
    }

    setLines() {
        this.setState({
            currentState: loadingOperation,
        });

        const unsigned = [];
        this.state.unsigned.forEach(
            (x, idx) => {
                const json = JSON.parse(x);

                this.setState({
                    loadingCurrent: idx + 1,
                    currOperation: x,
                })

                if (isOperation(json)) {
                    unsigned.push({ json, isCorrect: true });
                }
                else {
                    unsigned.push({ json, isCorrect: false });
                }
            }
        )

        this.props.setUnsigned(unsigned);
        this.setState({
            currentState: afterLoad,
        });
    }

    startSign() {
        this.setState({
            currentState: signingOperation,
        });
        running = true;
        this.processOperations();
    }

    signOperation(idx) {
        const signer = new Signer(this.props.networkId, this.props.priv);
        const signed = signer.signOperation(this.props.unsigned[idx].json);

        this.setState({
            signed: this.state.signed.push({json: signed, result: true})
        });
    }

    processOperations() {
        const startIdx = this.state.signed.length;
        const unsigned = this.props.unsigned;

        if (!running) { return; }
        for (var i = startIdx; i < unsigned.length; i++) {
            if (!running) { break; }
            this.setState({
                currOperation: JSON.stringify(unsigned[i].json)
            });

            if (!unsigned[i].isCorrect) {
                this.setState({
                    signed: this.state.signed.push({ json: unsigned[i].json, result: false })
                });
                continue;
            }

            this.signOperation(i);
        }

        if (this.state.unsigned.length <= this.state.signed.length) {
            this.setState({
                currentState: signDone
            });
            this.props.setSigned(this.state.signed);
        }
    }

    stopSign() {
        this.setState({
            currentState: stopSigning,
        });
        running = false;
    }

    clear() {
        this.props.clearBulks();
        this.setState({
            signed: [],
            unsigned: [],
            loadingCurrent: 0,
            loadingPercentage: 0,
            currentState: beforeLoad,
            currOperation: "",
        });
        running = false;
    }

    render() {
        const msg = "서명";
        const currentState = this.state.currentState;
        const currentLoad = currentState === signingOperation && running ? this.state.signed.length : this.state.loadingCurrent;

        return (
            <div className="bulk-sign-container">
                <h1>Sign Multiple Operations</h1>
                <p id="show-button" onClick={() => this.setState({ showRule: !this.state.showRule })}>CSV 작성 규칙 보기</p>
                <section id="bulk-rule" style={this.state.showRule ? {} : { display: "none" }}>
                    <h3>페이지 설명 보기</h3>
                    <ul>
                        <li key="exp1">이 페이지에서는 'Create Multiple Operation' 페이지에서 생성한 대용량 operation 파일만 사용할 수 있습니다.</li>
                        <li key="exp2">파일 텍스트의 각 한 줄은 하나의 operation json object에 해당합니다.</li>
                    </ul>
                </section>
                <section id="bulk-input">
                    <p id="exp">파일은 txt 형식이어야 합니다.</p>
                    <ReactFileReader handleFiles={this.readCSV} fileTypes={'.csv'}>
                        <button id="import-button">파일 가져오기</button>
                    </ReactFileReader>
                </section>
                <section id="loading">
                    <div id="loading-bar">
                        <div id="bar">
                            <p id="loading-current" style={{
                                width: this.state.loadingPercentage === 0
                                    ? "0%"
                                    : "" + parseInt(
                                        (parseFloat(currentLoad) / parseFloat(this.state.loadingPercentage)) * 100
                                    ) + "%",
                                border: "3px solid white",
                                backgroundColor: "white",
                                padding: "0",
                            }}></p>
                        </div>
                        <p id="process">{`${currentLoad} / ${this.state.loadingPercentage}`}</p>
                    </div>
                    <p id="exp-state">{currentState}</p>
                </section>
                <div id="bulk-button">
                    <ul>
                        <li key="start">
                            <button
                                style={(currentState === afterLoad || currentState === stopSigning) && this.props.unsigned.length > 0
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={currentState === afterLoad || currentState === stopSigning ? false : true}
                                onClick={() => this.startSign()}>서명 시작</button>
                            <p>{`대용량 작업 ${msg}을 시작합니다. ${msg} 중 중단한 작업 목록이 있는 경우 중단된 작업부터 다시 시작합니다.`}</p>
                        </li>
                        <li key="stop">
                            <button
                                style={currentState === signingOperation && currentState !== signDone && this.state.signed.length < this.props.unsigned.length
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={this.state.currentState === signingOperation ? false : true}
                                onClick={() => this.stopSign()}>일시 정지</button>
                            <p>{`대용량 작업 ${msg}을 일시 중지합니다. 다시 시작하는 경우 중단된 작업부터 다시 ${msg}됩니다.`}</p>
                        </li>
                        <li key="cancel">
                            <button
                                style={currentState === beforeLoad
                                    ? { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" } : { opacity: "1.0" }}
                                disabled={currentState === beforeLoad ? true : false}
                                onClick={() => this.clear()}>전체 취소</button>
                            <p>{`로딩된 모든 작업에 대한 ${msg}을 취소하고 로딩 내용을 초기화합니다.` + this.props.accountType === 'multi'
                                ? "" : " 이미 서명된 작업은 되돌릴 수 없습니다."}</p>
                        </li>
                    </ul>
                </div>
                <div className="bulk-process">
                    <pre>
                        {this.state.currOperation}
                    </pre>
                </div>
                <div className="bulk-main">
                    <p id="exp">{`${msg} 내역`}</p>
                    <CompleteJob sent={this.state.signed} onClick={(idx) => this.setState({ currOperation: JSON.stringify(this.props.unsigned[idx], null, 4) })} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    signed: state.bulk.signed,
    unsigned: state.bulk.unsigned,
    account: state.login.account,
    priv: state.login.priv,
    currencies: state.login.account.balances.map(x => x.currency),
    networkId: state.network.networkId,
});

const mapDispatchToProps = dispatch => ({
    setSigned: (signed) => dispatch(setSignedOperation(signed)),
    setUnsigned: (unsigned) => dispatch(setUnsignedOperation(unsigned)),
    clearBulks: () => dispatch(clearBulks()),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SignOperations);