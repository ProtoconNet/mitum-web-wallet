import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addHash, clearBulks, clearPriv, setBulks, setHashResult, setPriv, startLoad, startSend, stopSend } from '../store/actions';
import { afterLoad, beforeLoad, sendingOperation, stopSending } from '../store/reducers/BulkReducer';
import './BulkTransfer.scss';

import ReactFileReader from 'react-file-reader';

const singleMsg = "전송";
const multiMsg = "생성";

class BulkTransfer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loadingPercentage: 0,
            loadingCurrent: 0,

            csv: undefined,
        }

        this.readCSV = this.readCSV.bind(this);
    }

    componentWillUnmount() {
        if (this.props.bulks.length < 1) {
            this.props.clearBulks();
        }
    }

    readCSV(files) {
        var reader = new FileReader();
        reader.onload = (e) => {
            const lines = reader.result.split('\n');
            const len = lines.length;
            this.setState({
                csv: lines.splice(len - 1, 1),
                loadingPercentage: len - 1,
                loadingCurrent: 0,
            });
            this.parseCSV();
        }
        reader.readAsText(files[0]);
    }

    parseCSV() {
        this.props.startLoad();


    }

    async parseLine() {

    }

    startSend() {
        this.props.startSend();

        // const createAccount = (target) => {

        // }
        // const transfer = (target) => {

        // }
        // const createOperation = (target) => {

        // }
    }

    stopSend() {
        this.props.stopSend();
    }

    sentOperation(oper, idx) {
        return (
            <li key={idx}>
                <p>{idx}</p>
                <p>{oper.hash}</p>
                <p>{oper.result}</p>
            </li>
        )
    }

    render() {
        const msg = this.props.accountType === "multi" ? multiMsg : singleMsg;
        return (
            <div className="bulk-container">
                <h1>Send Multiple Operations</h1>
                <section id="bulk-rule">
                    <h3>CSV 작성 규칙</h3>
                    <ul>
                        <li key="ca">create-account 작업 명령 : ca</li>
                        <li key="tf">transfer 작업 명령 : tf</li>
                        <li key="key">key : $key+$weight</li>
                        <li key="amount">amount : $currency+$amount</li>
                        <li key="etc">receiver, threshold: 각각 $receiver, $threshold </li>
                        <li key="exp1">한 줄에 한 작업씩 작성합니다.</li>
                        <li key="exp2">작업 명령 (ca, tf)는 반드시 가장 앞, 왼쪽에 기입하며 나머지 요소의 순서는 고려하지 않아도 됩니다.</li>
                        <li key="exp3">작업은 입력한 순서대로 처리되지 않을 수 있습니다.</li>
                    </ul>
                    <h3>CSV 작성 예시</h3>
                    <ul>
                        <li key="ex1">ca, MCC+100000, PEN+2000000000, 23onySFFmozrmuthYWhDgQS48we9qertP7SSsMBbdAq2X:btc-pub-v0.0.1+100, 100</li>
                        <li key="ex2">ca, 23onySFFmozrmuthYWhDgQS48we9qertP7SSsMBbdAq2X:btc-pub-v0.0.1+90, MCC+10000, PEN+123456, 100</li>
                        <li key="ex3">tf, EEJpas2voqX9qPve1TG7TkYPNoDxqn3PVrMYvPQ3Z3JY:mca-v0.0.1, MCC+500000, PEN+2000</li>
                        <li key="ex4">tf, MCC+8000000000000, EEJpas2voqX9qPve1TG7TkYPNoDxqn3PVrMYvPQ3Z3JY:mca-v0.0.1</li>
                    </ul>
                </section>
                <div className="bulk-main">
                    <section id="bulk-input">
                        <p>파일은 csv 형식이어야 합니다.</p>
                        <ReactFileReader handleFiles={this.readCSV} fileTypes={'.csv'}>
                            <button id="import-button">파일 가져오기</button>
                        </ReactFileReader>
                    </section>
                    <section id="loading">
                        <div id="loading-bar">
                            <p id="loading-current"></p>
                            <p>{`${this.state.loadingCurrent} / ${this.state.loadingPercentage}`}</p>
                            <p>{this.props.currentState}</p>
                        </div>
                    </section>
                    <div id="bulk-button">
                        <ul>
                            <li key="start">
                                <button
                                    style={this.props.currentState === afterLoad || this.props.currentState === stopSending
                                        ? { opacity: "1.0" } : { opacity: "0.6" }}
                                    disabled={this.props.currentState === afterLoad || this.props.currentState === stopSending ? false : true}
                                    onClick={() => this.startSend()}>전송 시작</button>
                                <p>{`대용량 작업 ${msg}을 시작합니다. ${msg} 중 중단한 작업 목록이 있는 경우 중단된 작업부터 다시 시작합니다.`}</p>
                            </li>
                            <li key="stop">
                                <button
                                    style={this.props.currentState === sendingOperation ? { opacity: "1.0" } : { opacity: "0.6" }}
                                    disabled={this.props.currentState === sendingOperation ? false : true}
                                    onClick={() => this.stopSend()}>일시 정지</button>
                                <p>{`대용량 작업 ${msg}을 일시 중지합니다. 다시 시작하는 경우 중단된 작업부터 다시 ${msg}됩니다.`}</p>
                            </li>
                            <li key="cancel">
                                <button
                                    style={this.props.currentState === beforeLoad ? { opacity: "0.6" } : { opacity: "1.0" }}
                                    disabled={this.props.currentState === beforeLoad ? true : false}
                                    onClick={() => this.stopSend()}>전체 취소</button>
                                <p>{`로딩된 모든 작업에 대한 ${msg}을 취소하고 로딩 내용을 초기화합니다.` + this.props.accountType === 'multi'
                                    ? "" : " 이미 전송된 작업은 되돌릴 수 없습니다."}</p>
                            </li>
                        </ul>
                    </div>
                    <p>{`${msg} 완료된 작업이 아래에 표시됩니다.`}</p>
                    <ul>
                        {this.props.sent.map((x, idx) => this.sentOperation(x, idx))}
                    </ul>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => ({
    bulks: state.bulk.bulks,
    sent: state.bulk.result,
    currentState: state.bulk.state,
    accountType: state.login.account.accountType,
});

const mapDispatchToProps = dispatch => ({
    setPriv: (privs) => dispatch(setPriv(privs)),
    clearPriv: () => dispatch(clearPriv()),
    setBulks: (bulks) => dispatch(setBulks(bulks)),
    clearBulks: () => dispatch(clearBulks()),
    addHash: (hash) => dispatch(addHash(hash)),
    setHashResult: (hash, result) => dispatch(setHashResult(hash, result)),
    startLoad: () => dispatch(startLoad()),
    startSend: () => dispatch(startSend()),
    stopSend: () => dispatch(stopSend()),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BulkTransfer);