import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clearBulks, setBulks, setResult } from '../store/actions';
import { afterLoad, beforeLoad, createAccountsCommand, createAccountText, failText, invalidText, loadingOperation, pendingText, sendDone, sendingOperation, stopSending, successText, transfersCommand, transfersText } from '../store/reducers/BulkReducer';
import './BulkTransfer.scss';

import ReactFileReader from 'react-file-reader';
import CompleteJob from '../components/bulks/CompleteJob';
import { isAddressValid, isCurrencyValid, isNum, isPublicKeyValid, isWeightsValidToThres, isWeightValid } from '../lib/Validation';

import { Generator } from 'mitumc';
import axios from 'stellar-sdk/node_modules/axios';
import Sleep from '../lib/Sleep';

var running = false;

class BulkTransfer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loadingPercentage: this.props.bulks.length,
            loadingCurrent: this.props.sent.length,

            csv: [],
            result: [...this.props.sent],

            currentState: this.props.bulks.length > 0
                ? (this.props.bulks.length === this.props.sent.length ? sendDone : stopSending)
                : beforeLoad,
            showRule: false,

            detecting: false,

            currOperation: ""
        }

        this.readCSV = this.readCSV.bind(this);
    }

    componentWillUnmount() {
        if (this.props.bulks.length < 1) {
            this.props.clearBulks();
        }
        else {
            this.props.setResult(this.state.result);
        }
    }

    readCSV(files) {
        var reader = new FileReader();
        reader.onload = (e) => {
            const lines = reader.result.split('\n');
            const len = lines.length;
            this.setState({
                csv: lines.slice(0, len - 1),
                loadingPercentage: len - 1,
                loadingCurrent: 0,
            });
            this.parseCSV();
        }
        reader.readAsText(files[0]);
    }

    parseCSV() {
        this.setState({
            currentState: loadingOperation,
        });

        const csvs = this.state.csv;
        const bulks = csvs.map(
            csv => {
                const splitted = csv.split(',');
                return this.parseSplitted(splitted);
            }
        );
        this.props.setBulks(bulks, csvs);
        this.setState({
            currentState: afterLoad,
        });
    }

    parseSplitted(csv) {
        const parsed = {};
        parsed.type = csv[0].trim();
        csv.slice(1, csv.length).forEach(
            x => {
                x = x.trim();
                if (isAddressValid(x) && !Object.prototype.hasOwnProperty.call(x, 'receiver')) {
                    parsed.receiver = x;
                    return;
                }
                if (isNum(x) && !Object.prototype.hasOwnProperty.call(x, 'threshold')) {
                    parsed.threshold = parseInt(x);
                    return;
                }

                const idx = x.indexOf('+');
                if (idx < 0) {
                    return;
                }

                const keyOrCurrency = x.substring(0, idx);
                const weightOrAmount = x.substring(idx + 1);

                if (isPublicKeyValid(keyOrCurrency) && isWeightValid(weightOrAmount)) {
                    if (!Object.prototype.hasOwnProperty.call(parsed, "keys")) {
                        parsed.keys = [];
                    }

                    if (!(process.env.REACT_APP_LIMIT_KEYS_IN_KEYS < parsed.keys.length)) {
                        parsed.keys = [...parsed.keys, { key: keyOrCurrency, weight: parseInt(weightOrAmount) }];
                    }
                }
                else if (isCurrencyValid(keyOrCurrency, this.props.currencies) && isNum(weightOrAmount)) {
                    if (!Object.prototype.hasOwnProperty.call(parsed, 'amounts')) {
                        parsed.amounts = [];
                    }
                    if (!(process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM < parsed.amounts.length)) {
                        parsed.amounts = [...parsed.amounts, { currency: keyOrCurrency, amount: weightOrAmount }];
                    }
                }
            }
        );

        if (Object.prototype.hasOwnProperty.call(parsed, 'threshold')
            && Object.prototype.hasOwnProperty.call(parsed, 'keys')
            && !isWeightsValidToThres(parsed.keys.map(x => x.weight), "" + parsed.threshold)) {
            parsed.type = invalidText;
        }

        switch (parsed.type) {
            case createAccountsCommand:
                if (!Object.prototype.hasOwnProperty.call(parsed, "keys")) {
                    parsed.type = invalidText;
                }
                else if (!Object.prototype.hasOwnProperty.call(parsed, "amounts")) {
                    parsed.type = invalidText;
                }
                else if (!Object.prototype.hasOwnProperty.call(parsed, "threshold")) {
                    parsed.type = invalidText;
                }
                break;
            case transfersCommand:
                if (!Object.prototype.hasOwnProperty.call(parsed, "receiver")) {
                    parsed.type = invalidText;
                }
                else if (!Object.prototype.hasOwnProperty.call(parsed, "amounts")) {
                    parsed.type = invalidText;
                }
                break;
            default:
                parsed.type = invalidText;
        }

        this.setState({ loadingCurrent: this.state.loadingCurrent + 1, currOperation: csv.toString() ? csv.toString() : this.state.currOperation });
        return parsed;
    }

    createAccountItem(x) {
        const generator = new Generator(this.props.networkId);
        const keys = generator.createKeys(
            x.keys.map(y =>
                generator.formatKey(y.key, parseInt(y.weight))),
            parseInt(x.threshold)
        );

        const amounts = generator.createAmounts(
            x.amounts.map(y =>
                generator.formatAmount(y.amount, y.currency))
        );

        return generator.createCreateAccountsItem(keys, amounts);
    }

    transfersItem(x) {
        const generator = new Generator(this.props.networkId);

        const amounts = generator.createAmounts(
            x.amounts.map(y =>
                generator.formatAmount(y.amount, y.currency))
        );

        return generator.createTransfersItem(
            x.receiver.trim(), amounts
        )
    }

    async broadcast(operation) {
        return await axios.post(this.props.networkBroadcast, operation);
    }

    startSend() {
        this.setState({
            currentState: sendingOperation,
        });
        running = true;
        this.processOperations();
    }

    processOperations() {
        const generator = new Generator(this.props.networkId);
        let caItems = [];
        let tfItems = [];
        const { account } = this.props;

        const bulks = this.props.bulks;
        const startIdx = this.state.result.length;

        if (!running) { return; }
        for (var i = startIdx; i < bulks.length; i++) {
            if (!running) { return; }
            this.setState({
                currOperation: JSON.stringify(bulks[i])
            });
            switch (bulks[i].type) {
                case createAccountText:
                    caItems.push({ idx: i, item: this.createAccountItem(bulks[i]) });
                    break;
                case transfersText:
                    tfItems.push({ idx: i, item: this.transfersItem(bulks[i]) });
                    break;
                default:
                    var _result = this.state.result;
                    _result.push({ idx: i, hash: null, result: failText })
                    this.setState({
                        result: _result,
                    });
                    break;
            }
        }

        if (!running) { return; }
        if (caItems.length > 0) {
            var j;
            for (j = 0; j < parseInt(caItems.length / 10); j++) {
                const items = caItems.slice(j * 10, 10 * (j + 1));
                const createAccountsFact = generator.createCreateAccountsFact(
                    account.address,
                    items.map(item => item.item),
                );

                const createAccounts = generator.createOperation(createAccountsFact, "");
                createAccounts.addSign(this.props.priv);

                this.sendOperation(items, createAccounts.dict());
            }

            if (caItems.length % 10) {
                const items = caItems.slice(caItems.length - caItems.length % 10, caItems.length);
                const createAccountsFact = generator.createCreateAccountsFact(
                    account.address,
                    items.map(item => item.item),
                );

                const createAccounts = generator.createOperation(createAccountsFact, "");
                createAccounts.addSign(this.props.priv);

                this.sendOperation(items, createAccounts.dict());
            }
        }

        if (!running) { return; }
        if (tfItems.length > 0) {
            for (j = 0; j < parseInt(tfItems.length / 10); j++) {
                const items = tfItems.slice(10 * j, 10 * (j + 1));
                const transfersFact = generator.createTransfersFact(
                    account.address,
                    items.map(item => item.item),
                );

                const transfers = generator.createOperation(transfersFact, "");
                transfers.addSign(this.props.priv);

                this.sendOperation(items, transfers.dict());
            }

            if (tfItems.length % 10) {
                const items = tfItems.slice(tfItems.length - tfItems.length % 10, tfItems.length);
                const transfersFact = generator.createTransfersFact(
                    account.address,
                    items.map(item => item.item),
                );

                const transfers = generator.createOperation(transfersFact, "");
                transfers.addSign(this.props.priv);

                this.sendOperation(items, transfers.dict());
            }
        }

        if (this.props.bulks.length <= this.state.result.length) {
            this.setState({
                currentState: sendDone,
            });
            this.props.setResult(this.state.result);
        }
        running = false;
    }

    sendOperation(items, operation) {

        this.broadcast(operation)
            .then(
                res => {
                    const newResult = [];
                    if (res.request.status !== 200) {
                        var i;
                        for (i = 0; i < items.length; i++) {
                            newResult.push({ idx: items[i].idx, hash: operation.fact.hash, result: failText });
                        }
                    }
                    else {
                        for (i = 0; i < items.length; i++) {
                            newResult.push({ idx: items[i].idx, hash: operation.fact.hash, result: pendingText });
                        }
                    }
                    const result = this.state.result.concat(newResult);
                    if (this.props.bulks.length <= this.state.result.length + items.length) {
                        this.setState({
                            currentState: sendDone,
                            result,
                        });
                        this.props.setResult(result);
                    }
                    else {
                        this.setState({
                            result,
                        });
                    }
                }
            ).catch(
                e => {
                    const newResult = [];
                    for (var i = 0; i < items.length; i++) {
                        newResult.push({ idx: items[i].idx, hash: operation.fact.hash, result: failText });
                    }

                    const result = this.state.result.concat(newResult);
                    if (this.props.bulks.length <= this.state.result.length + items.length) {
                        this.setState({
                            result,
                            currentState: sendDone,
                        });
                        this.props.setResult(this.state.result);
                    }
                    else {
                        this.setState({
                            result,
                        })
                    }
                }
            )

        if (this.props.bulks.length <= this.state.result.length) {
            this.setState({
                currentState: sendDone,
            });
            this.props.setResult(this.state.result);
        }
    }

    stopSend() {
        this.setState({
            currentState: stopSending,
        });
        running = false;
    }

    clear() {
        this.props.clearBulks();
        this.setState({
            csv: [],
            result: [],
            loadingCurrent: 0,
            loadingPercentage: 0,
            currentState: beforeLoad,
            currOperation: "",
        });
        running = false;
    }

    async lookup() {
        let detecting = true;
        this.setState({ detecting: true });

        while (detecting) {
            this.getAllState();

            detecting = false;
            await Sleep(3000);
            this.state.result.forEach(
                x => {
                    if (x.result === pendingText) {
                        detecting = true;
                    }
                }
            );
        }

        this.setState({
            detecting: false
        });
    }

    async getFactInState(hash) {
        return await axios.get(this.props.networkSearchFact + hash);
    }

    getAllState() {
        this.state.result.forEach(
            (x, idx) => {
                this.setState({
                    currOperation: "idx: " + idx + ", hash: " + (x.hash ? x.hash : " - ")
                });

                if (!x.hash) {
                    return;
                }
                if (x.result !== pendingText) {
                    return;
                }

                this.getFactInState(x.hash)
                    .then(
                        res => {
                            if (res.data._embedded.in_state) {
                                this.setState({
                                    result: this.state.result.slice(0, idx)
                                        .concat([{ ...x, result: successText }])
                                        .concat(this.state.result.slice(idx + 1, this.state.result.length))
                                });
                            }
                            else {
                                this.setState({
                                    result: this.state.result.slice(0, idx)
                                        .concat([{ ...x, result: failText }])
                                        .concat(this.state.result.slice(idx + 1, this.state.result.length))
                                });
                            }
                        }
                    )
                    .catch(
                        e => {
                            if (e.response.status === 404 || e.response.status === 400) {
                                return;
                            }
                            else {
                                this.setState({
                                    result: this.state.result.slice(0, idx)
                                        .concat([{ ...x, result: failText }])
                                        .concat(this.state.result.slice(idx + 1, this.state.result.length))
                                });
                            }
                        }
                    )
            }
        );
    }

    render() {
        const msg = "전송";
        const currentState = this.state.currentState;
        const currentLoad = currentState === sendingOperation && running ? this.state.result.length : this.state.loadingCurrent;

        return (
            <div className="bulk-container">
                <h1>Send Multiple Operations</h1>
                <p id="show-button" onClick={() => this.setState({ showRule: !this.state.showRule })}>CSV 작성 규칙 보기</p>
                <section id="bulk-rule" style={this.state.showRule ? {} : { display: "none" }}>
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
                        <li key="exp4">입력한 내용 중 유효하지 않은 요소가 있으면 그 요소는 무시됩니다. ex) PEN+001, PEN+-3, MCC+PEN, $key+MCC 등</li>
                        <li key="exp5">한 작업에 대해 입력한 내용 중 receiver, threshold가 각각 여러 개 있는 경우 가장 앞, 왼쪽에 기입한 요소만 유효합니다. </li>
                        <li key="exp6">입력한 currency를 보유하고 있지 않은 경우 해당 작업은 무시됩니다.</li>
                        <li key="exp7">중복된 receiver를 입력하지 않도록 주의하세요.</li>
                        <li key="exp8">{`한 작업 당 ${process.env.REACT_APP_LIMIT_KEYS_IN_KEYS}개를 초과하는 key가 입력되는 경우 앞서 기입한 키 10개만 허용합니다.`}</li>
                        <li key="exp9">{`한 작업 당 ${process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM}개를 초과하는 amount가 입력되는 경우 앞서 기입한 amount 10개만 허용합니다.`}</li>
                    </ul>
                    <h3>CSV 작성 예시</h3>
                    <ul>
                        <li key="ex1">ca, MCC+100000, PEN+2000000000, 23onySFFmozrmuthYWhDgQS48we9qertP7SSsMBbdAq2X:btc-pub-v0.0.1+100, 100</li>
                        <li key="ex2">ca, 23onySFFmozrmuthYWhDgQS48we9qertP7SSsMBbdAq2X:btc-pub-v0.0.1+90, MCC+10000, PEN+123456, 100</li>
                        <li key="ex3">tf, EEJpas2voqX9qPve1TG7TkYPNoDxqn3PVrMYvPQ3Z3JY:mca-v0.0.1, MCC+500000, PEN+2000</li>
                        <li key="ex4">tf, MCC+8000000000000, EEJpas2voqX9qPve1TG7TkYPNoDxqn3PVrMYvPQ3Z3JY:mca-v0.0.1</li>
                    </ul>
                </section>
                <section id="bulk-input">
                    <p id="exp">파일은 csv 형식이어야 합니다.</p>
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
                                style={(currentState === afterLoad || currentState === stopSending) && this.props.bulks.length > 0
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={currentState === afterLoad || currentState === stopSending ? false : true}
                                onClick={() => this.startSend()}>전송 시작</button>
                            <p>{`대용량 작업 ${msg}을 시작합니다. ${msg} 중 중단한 작업 목록이 있는 경우 중단된 작업부터 다시 시작합니다.`}</p>
                        </li>
                        <li key="stop">
                            <button
                                style={currentState === sendingOperation && currentState !== sendDone && this.state.result.length < this.props.bulks.length
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={this.state.currentState === sendingOperation ? false : true}
                                onClick={() => this.stopSend()}>일시 정지</button>
                            <p>{`대용량 작업 ${msg}을 일시 중지합니다. 다시 시작하는 경우 중단된 작업부터 다시 ${msg}됩니다.`}</p>
                        </li>
                        <li key="cancel">
                            <button
                                style={currentState === beforeLoad
                                    ? { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" } : { opacity: "1.0" }}
                                disabled={currentState === beforeLoad ? true : false}
                                onClick={() => this.clear()}>전체 취소</button>
                            <p>{`로딩된 모든 작업에 대한 ${msg}을 취소하고 로딩 내용을 초기화합니다.` + this.props.accountType === 'multi'
                                ? "" : " 이미 전송된 작업은 되돌릴 수 없습니다."}</p>
                        </li>
                        <li id="lookup">
                            <button
                                style={currentState !== sendDone
                                    ? { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" } : { opacity: "1.0" }}
                                disabled={currentState !== sendDone ? true : false}
                                onClick={() => this.lookup()}>결과 조회</button>
                            <p>{`${msg} 전송 도중에는 이 페이지에서 작업 처리 결과를 조회할 수 없습니다. 다른 페이지로 이동 시 조회가 중단됩니다.`}</p>
                        </li>
                    </ul>
                </div>
                <div className="bulk-process">
                    <pre>
                        {this.state.currOperation}
                    </pre>
                </div>
                <div className="bulk-main">
                    <p id="exp">{`${msg} 내역${this.state.detecting ? " (결과 조회 중...)" : ""}`}</p>
                    <CompleteJob sent={this.state.result} onClick={(idx) => this.setState({ currOperation: this.props.bulks[idx].origin})} />
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => ({
    bulks: state.bulk.bulks,
    sent: state.bulk.result,
    account: state.login.account,
    priv: state.login.priv,
    currencies: state.login.account.balances.map(x => x.currency),
    networkId: state.network.networkId,
    networkBroadcast: state.network.networkBroadcast,
    networkSearchFact: state.network.networkSearchFact,
});

const mapDispatchToProps = dispatch => ({
    setBulks: (bulks, origin) => dispatch(setBulks(bulks, origin)),
    clearBulks: () => dispatch(clearBulks()),
    setResult: (result) => dispatch(setResult(result)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BulkTransfer);