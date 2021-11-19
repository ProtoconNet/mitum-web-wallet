import React, { Component } from 'react';
import './CreateBulk.scss';

import ReactFileReader from 'react-file-reader';
import { ca, tf } from '../../store/reducers/BulkReducer';
import { isAddressValid, isCurrencyValid, isNum, isPublicKeyValid, isWeightsValidToThres, isWeightValid } from '../../lib/Validation';
import CSVResult from './CSVResult';
import CreateResult from './CreateResult';
import axios from 'axios';
import bigInt from 'big-integer';
import { Generator } from 'mitumc';
import { connect } from 'react-redux';
import { clearCsvs, csvToOperation, setCsvs } from '../../store/actions';

const invalidWeightReason = "Wrong weight";
// const invalidThresholdReason = "Wrong threshold";
const weightLessThanThresholdReason = "weight < threshold";
const invalidCurrencyReason = "Wrong currency id";
const invalidAmountReason = "Wrong amount";
const amountExceedLimitReason = "amount item length > " + process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM;
// const amountExceedBalanceReason = "Total amount > your balance";
const invalidAddressReason = "Wrong address";
const addressAlreadyExistReason = "Address already exist";
const receiverNotExistReason = "Receiver address not exist";
const invalidKeyFormatReason = "Wrong key format - $key?threshold=$threshold&weight=$weight";
const invalidPublicKeyReason = "Wrong public key";
const invalidCommandReason = "Wrong command - ca, tf";

class CreateBulk extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showRule: false,
            running: false,
            showParsed: true,
            reason: "",
            result: [],
            csv: [],
            parsed: [],

            download: null,
            filename: "",
        }

        this.readCSV = this.readCSV.bind(this);
    }

    componentWillUnmount() {
        if (this.props.csv.length > 0) {
            this.props.clearCsv();
        }
    }

    readCSV(files) {
        var reader = new FileReader();
        reader.onload = (e) => {
            const lines = reader.result.split('\n');
            const len = lines.length;
            const _csv = lines.slice(0, len - 1);
            this.setState({
                csv: _csv,
            });
            this.parseCSV();
        }
        reader.readAsText(files[0]);
    }

    parseCSV() {
        const csvs = this.state.csv;

        const parsed = csvs.map(
            csv => this.parseSplitted(csv)
        );

        this.setState({ parsed, });
        this.props.setCsv(parsed);
    }

    parseSplitted(csv) {
        const splitted = csv.split(',');
        const parsed = {};
        parsed.type = splitted[0].trim();
        parsed.oper = csv;
        parsed.valid = true;
        parsed.reason = null;

        switch (parsed.type) {
            case ca:
                var _ = splitted[1].trim().split('?threshold=');
                if (_[0] === splitted[1].trim()) {
                    parsed.valid = false;
                    parsed.reason = invalidKeyFormatReason;
                    break;
                }
                var __ = _[1].split('&weight=');
                if (__[0] === _[1]) {
                    parsed.valid = false;
                    parsed.reason = invalidKeyFormatReason;
                    break;
                }

                var key = _[0];
                var threshold = __[0];
                var weight = __[1];

                if (!isPublicKeyValid(key)) {
                    parsed.valid = false;
                    parsed.reason = invalidPublicKeyReason;
                    break;
                }
                if (!isWeightValid(weight)) {
                    parsed.valid = false;
                    parsed.reason = invalidWeightReason;
                    break;
                }
                if (!isWeightsValidToThres([weight], threshold)) {
                    parsed.valid = false;
                    parsed.reason = weightLessThanThresholdReason;
                    break;
                }
                parsed.key = key.trim();
                parsed.weight = weight.trim();
                parsed.threshold = threshold.trim();
                break;
            case tf:
                var receiver = splitted[1].trim();
                if (!isAddressValid(receiver)) {
                    parsed.valid = false;
                    parsed.reason = invalidAddressReason;
                    break;
                }
                parsed.receiver = receiver;
                break;
            default:
                parsed.type = "invalid";
                parsed.valid = false;
                parsed.reason = invalidCommandReason;
                break;
        }

        if (parsed.type === "invalid" || !parsed.valid) {
            return parsed;
        }

        const _amts = splitted.slice(2, splitted.length);
        var i, currency, amount;
        const currencies = this.props.account.balances.map(x => x.currency);
        const amounts = [];
        for (i = 0; i < _amts.length; i += 2) {
            currency = _amts[i];
            amount = _amts[i + 1];

            if (!isCurrencyValid(currency, currencies)) {
                parsed.valid = false;
                parsed.reason = invalidCurrencyReason;
                break;
            }
            if (!isNum(amount)) {
                parsed.valid = false;
                parsed.reason = invalidAmountReason;
                break;
            }

            amounts.push({ currency: currency.trim(), amount: amount.trim(), });
        }

        if (!parsed.valid) {
            return parsed;
        }

        if (amounts.length < 1 || amounts.length > process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM) {
            parsed.reason = amountExceedLimitReason;
            parsed.valid = false;
        }
        else {
            parsed.amounts = amounts;
        }

        return parsed;
    }

    async startCreate() {
        var valid = true;
        this.props.csv.forEach(
            x => valid = valid && x.valid
        );
        if (!valid) {
            this.setState({
                reason: "CSV에 잘못된 작업 명령이 있습니다. 작업을 시작할 수 없습니다."
            });
            return;
        }

        if (!this.checkAmounts()) {
            this.setState({
                reason: "보내려는 모든 토큰 amount의 합이 보유한 토큰의 총량을 넘습니다. 작업을 시작할 수 없습니다."
            });
            return;
        }

        var newParsed;
        const result = await this.checkAddress();
        if (result === "duplicate") {
            this.setState({
                reason: "생성, 혹은 송금하려는 주소 중 중복된 주소가 있습니다. 작업을 시작할 수 없습니다."
            });
            return;
        }
        else {
            const resultSet = new Set(result);
            if (resultSet.has(false)) {
                newParsed = this.state.parsed
                    .map(
                        (x, idx) => {
                            if (x.valid && !result[idx]) {
                                if (x.type === ca) {
                                    return {
                                        ...x,
                                        valid: false,
                                        reason: addressAlreadyExistReason,
                                    };
                                }
                                else if (x.type === tf) {
                                    return {
                                        ...x,
                                        valid: false,
                                        reason: receiverNotExistReason,
                                    };
                                }
                                else {
                                    return {
                                        ...x,
                                        valid: false,
                                        reason: invalidCommandReason,
                                    };
                                }
                            }
                            return x;
                        }
                    );
                this.setState({
                    parsed: newParsed,
                    reason: "생성하려는 주소가 이미 존재하거나 송금하려는 주소가 존재하지 않습니다. 작업을 시작할 수 없습니다."
                });
                this.props.setCsv(newParsed);
                return;
            }
        }

        newParsed = this.state.parsed;
        this.setState({
            reason: "작업을 생성 중입니다. 생성 중 다른 페이지로 이동하지 마십시오.",
            running: true,
            showParsed: false,
        });

        await this.props.csvToOper(newParsed, this.props.networkId, this.props.account.address, this.props.priv);

        const link = this.download();
        const filename = "bulk_" + Date.now().toFixed();

        this.setState({
            reason: "작업 생성이 완료되었습니다.",
            running: false,
            result: this.props.created.map(x => ({...x, result: "success"})),
            download: link,
            filename,
        })
    }

    checkAmounts() {
        const parsed = this.state.parsed;
        const currencies = this.props.account.balances.map(x => ({ ...x, amount: bigInt(x.amount) }));

        const total = {};
        var currency, amount;
        parsed.forEach(
            x => {
                x.amounts.forEach(
                    y => {
                        currency = y.currency;
                        amount = y.amount;

                        if (!Object.prototype.hasOwnProperty.call(total, currency)) {
                            total[currency] = bigInt(0);
                        }

                        total[currency] = bigInt(amount).add(total[currency]);
                    }
                )
            }
        )

        var valid = true;
        currencies.forEach(
            x => {
                if (Object.prototype.hasOwnProperty.call(total, x.currency)) {
                    if (bigInt(total[x.currency]).greater(x.amount)) {
                        valid = false;
                    }
                }
            }
        )

        return valid;
    }

    async checkAddress() {
        const parsed = this.state.parsed;
        const target = [];
        const addresses = [];

        const generator = new Generator("");
        var keys;
        parsed.forEach(
            x => {
                if (!x.valid) {
                    target.push(this.addressExist(null, null));
                    return;
                }

                switch (x.type) {
                    case ca:
                        keys = generator.createKeys([generator.formatKey(x.key, parseInt(x.weight))], parseInt(x.threshold));
                        addresses.push(keys.address);
                        target.push(this.addressExist(keys.address, ca));
                        break;
                    case tf:
                        addresses.push(x.receiver);
                        target.push(this.addressExist(x.receiver, tf));
                        break;
                    default:
                        target.push(this.addressExist(null, null));
                        break;
                }
            }
        )

        const addressSet = new Set(addresses);
        if (addressSet.size !== addresses.length) {
            return "duplicate";
        }

        return await Promise.all(target);
    }

    addressExist(address, type) {
        if (!address || !type) {
            return false;
        }

        return axios.get(this.props.network + "/account/" + address)
            .then(
                res => {
                    if (type === ca) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            )
            .catch(
                e => {
                    if (type === ca) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            )
    }

    download() {
        const operations = this.props.created.map(x => x.operation);
        const all = {
            operations,
        };

        let file;
        try {
            file = new File([JSON.stringify(all, null, 4)], "bulk_" + all.operations[0].fact.hash, { type: 'application/json' });
        } catch (e) {
            alert('파일 다운로드 url을 얻을 수 없습니다.');
            return undefined;
        }
    
        return URL.createObjectURL(file); 
    }

    clear() {
        this.props.clearCsv();
        this.setState({
            csv: [],
            parsed: [],
            result: [],
            reason: "",
            showRule: false,
            showParsed: true,
            running: false,
            filename: "",
            download: null,
        });
    }

    render() {
        const { csv } = this.props;
        const { showRule, running, reason, result } = this.state;

        return (
            <div className="create-bulk-container">
                <h1>Create Multiple Operations</h1>
                <p id="show-button" onClick={() => this.setState({ showRule: !showRule })}>CSV 작성 규칙 보기</p>
                <section id="bulk-rule" style={showRule ? {} : { display: "none" }}>
                    <h3>CSV 작성 규칙</h3>
                    <ul>
                        <li key="ca"><p>create-account 작업 명령 : ca, $publickey?threshold=$threshold&weight=$weight, token0, amount0, token1, amount1, ...</p></li>
                        <li key="tf"><p>transfer 작업 명령 : tf, $receiver, token0, amount0, token1, amount1, ...</p></li>
                        <li key="key"><p>key : $key?threshold=$threshold&weight=$weight</p></li>
                        <li key="amount"><p>amount : $currency, $amount</p></li>
                        <li key="etc"><p>receiver: $receiver </p></li>
                        <li key="exp1"><p>한 줄에 한 작업씩 작성합니다.</p></li>
                        <li key="exp2"><p>작업 명령 (ca, tf)는 반드시 가장 앞에 기입합니다.</p></li>
                        <li key="exp3"><p>작업은 입력한 순서대로 처리되지 않을 수 있습니다.</p></li>
                        <li key="exp6"><p>작업 명령 형식에 맞지 않은 경우, receiver가 존재하지 않는 경우,
                            해당 토큰을 가지고 있지 않거나 보내려는 amount의 총합이 보유한 balance보다 작은 경우, 생성하려는 주소가 이미 등록되어있는 경우 등 유효하지 않은 작업의 경우
                            대용량 작업을 생성, 전송할 수 없습니다.</p></li>
                        <li key="exp7"><p>중복된 receiver를 입력하지 않도록 주의하세요.</p></li>
                        <li key="exp8"><p>create-account의 경우, single sig account 생성만 지원합니다.</p></li>
                        <li key="exp9"><p>{`한 작업 당 ${process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM}개를 초과하는 amount가 입력되는 경우 앞서 기입한 amount 10개만 허용합니다.`}</p></li>
                    </ul>
                    <h3>CSV 작성 예시</h3>
                    <ul>
                        <li key="ex1"><p>ca, 23onySFFmozrmuthYWhDgQS48we9qertP7SSsMBbdAq2X~btc-pub-v0.0.1?threshold=100&weight=100, MCC, 100000, PEN, 2000000000 </p></li>
                        <li key="ex4"><p>tf, EEJpas2voqX9qPve1TG7TkYPNoDxqn3PVrMYvPQ3Z3JY:mca-v0.0.1, MCC, 8000000000000, PEN, 1000</p></li>
                    </ul>
                </section>
                <section id="bulk-input">
                    <p id="exp">파일은 csv 형식이어야 합니다.</p>
                    <ReactFileReader handleFiles={this.readCSV} fileTypes={'.csv'}>
                        <button id="import-button">파일 가져오기</button>
                    </ReactFileReader>
                </section>
                <section id="bulk-text">
                    <p>{csv.length < 1 ? "불러온 대용량 작업이 없습니다." : reason ? reason : "이제 생성을 시작할 수 있습니다."}</p>
                </section>
                <div id="bulk-button">
                    <ul>
                        <li key="start">
                            <button
                                style={csv.length > 0 && !running && csv.length > result.length
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={csv.length > 0 && !running ? false : true}
                                onClick={() => this.startCreate()}>생성 시작</button>
                            <p>{`대용량 작업 생성을 시작합니다. 생성 전 작업 유효성 확인이 진행됩니다.`}</p>
                        </li>
                        <li key="cancel">
                            <button
                                style={csv.length > 0 && !running
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={csv.length > 0 && !running ? false : true}
                                onClick={() => this.clear()}>초기화</button>
                            <p>{`로딩된 모든 작업 내용을 초기화합니다.`}</p>
                        </li>
                    </ul>
                </div>
                <a id="create-download" target="_blank" download={this.state.filename}
                    style={result.length > 0 ? { opacity: "1.0" } : { opacity: "0.6" }}
                    disabled={result.length > 0 ? false : true}
                    href={this.state.download} rel="noreferrer">작업 파일 다운로드</a>
                <div className="bulk-main">
                    <p id="exp">{this.state.showParsed ? "작업 내역" : "생성 내역"}</p>
                    {this.state.showParsed ? <CSVResult csvs={this.state.parsed} /> 
                    : <CreateResult showContains={true} isNew={true} csvs={this.state.parsed} created={this.state.result} />}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    csv: state.bulk.csv,
    created: state.bulk.json,
    account: state.login.account,
    priv: state.login.priv,
    network: state.network.network,
    networkId: state.network.networkId,
});

const mapDispatchToProps = dispatch => ({
    setCsv: csv => dispatch(setCsvs(csv)),
    clearCsv: () => dispatch(clearCsvs()),
    csvToOper: (parsed, id, address, priv) => dispatch(csvToOperation(parsed, id, address, priv)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreateBulk);