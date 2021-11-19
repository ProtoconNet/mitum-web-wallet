import React, { Component } from 'react';
import { connect } from 'react-redux';
import './SendBulk.scss';

import axios from 'axios';
import ReactFileReader from 'react-file-reader';
import BroadcastResult from './BroadcastResult';
import CSVResult from './CSVResult';
import { isOperation } from '../../lib/Validation';
import { ca, tf } from '../../store/reducers/BulkReducer';
import { TYPE_CREATE_ACCOUNT, TYPE_TRANSFER } from '../../text/mode';
import bigInt from 'big-integer';
import { Generator } from 'mitumc';

import Sleep from '../../lib/Sleep';

const addressAlreadyExistReason = "Address already exist";
const receiverNotExistReason = "Receiver address not exist";
const invalidCommandReason = "Wrong command - ca, tf";

class SendBulk extends Component {
    constructor(props) {
        super(props);

        this.state = {
            running: false,
            reason: "",
            result: [],
            operations: [],

            valid: true,
            showParsed: true,
        }

        this.readJson = this.readJson.bind(this);
    }

    readJson(files) {
        var reader = new FileReader();
        reader.onload = (e) => {
            const json = JSON.parse(reader.result);
            if (!Object.prototype.hasOwnProperty.call(json, 'operations')) {
                this.setState({
                    reason: "올바른 대용량 작업 파일이 아닙니다.",
                    valid: false,
                });
                return;
            }
            const operations = json.operations.map(x => x);
            this.parseOperations(operations);
        }
        reader.readAsText(files[0]);
    }

    parseOperations(operations) {
        const checked = operations.map(
            x => {
                if (isOperation(x)) {
                    const type = x._hint === TYPE_CREATE_ACCOUNT ? ca : x._hint === TYPE_TRANSFER ? tf : "invalid";

                    switch (type) {
                        case ca:
                            if (!Object.prototype.hasOwnProperty.call(x.fact, "items")) {
                                return {
                                    operation: x,
                                    oper: x.fact.hash,
                                    idxs: [],
                                    valid: false,
                                    result: "invalid",
                                    reason: "No item in fact",
                                    type,
                                }
                            }
                            for (var i = 0; i < x.fact.items; i++) {
                                if (!Object.prototype.hasOwnProperty.call(x.fact.item[i], "keys")) {
                                    return {
                                        operation: x,
                                        oper: x.fact.hash,
                                        idxs: [],
                                        valid: false,
                                        result: "invalid",
                                        reason: "No keys in item",
                                        type,
                                    }
                                }
                                if (!Object.prototype.hasOwnProperty.call(x.fact.item[i], "amounts")) {
                                    return {
                                        operation: x,
                                        oper: x.fact.hash,
                                        idxs: [],
                                        valid: false,
                                        result: "invalid",
                                        reason: "No amounts in fact",
                                        type,
                                    }
                                }
                            }
                            break;
                        case tf:
                            if (!Object.prototype.hasOwnProperty.call(x.fact, "items")) {
                                return {
                                    operation: x,
                                    oper: x.fact.hash,
                                    idxs: [],
                                    valid: false,
                                    result: "invalid",
                                    reason: "No item in fact",
                                    type,
                                }
                            }
                            for (i = 0; i < x.fact.items; i++) {
                                if (!Object.prototype.hasOwnProperty.call(x.fact.item[i], "receiver")) {
                                    return {
                                        operation: x,
                                        oper: x.fact.hash,
                                        idxs: [],
                                        valid: false,
                                        result: "invalid",
                                        reason: "No receiver in item",
                                        type,
                                    }
                                }
                                if (!Object.prototype.hasOwnProperty.call(x.fact.item[i], "amounts")) {
                                    return {
                                        operation: x,
                                        oper: x.fact.hash,
                                        idxs: [],
                                        valid: false,
                                        result: "invalid",
                                        reason: "No amounts in fact",
                                        type,
                                    }
                                }
                            }
                            break;
                        default:
                            return {
                                operation: x,
                                oper: x.fact.hash,
                                idxs: [],
                                valid: false,
                                result: "invalid",
                                reason: "Wrong type operation",
                                type,
                            }
                    }

                    return {
                        operation: x,
                        oper: x.fact.hash,
                        idxs: [],
                        valid: true,
                        result: "valid",
                        reason: "",
                        type,
                    }
                }
                else {
                    return {
                        operation: x,
                        oper: Object.prototype.hasOwnProperty.call(x, "fact") && Object.prototype.hasOwnProperty.call(x.fact, "hash") ? x.fact.hash : "has doesn't exist",
                        idxs: [],
                        valid: false,
                        result: "invalid",
                        reason: "Wrong format operation",
                        type: x._hint === TYPE_CREATE_ACCOUNT ? ca : x._hint === TYPE_TRANSFER ? tf : "invalid",
                    }
                }
            }
        );

        const resultSet = new Set(checked.map(x => x.valid));

        this.setState({
            operations: checked,
            valid: !resultSet.has(false),
        });
    }

    clear() {
        this.setState({
            running: false,
            reason: "",
            operations: [],
            result: [],
            valid: false,
            showParsed: true,
        });
    }

    async startSend() {
        if (!this.checkAmounts()) {
            this.setState({
                reason: "보내려는 모든 토큰 amount의 합이 보유한 토큰의 총량을 넘습니다. 작업을 시작할 수 없습니다.",
                valid: false,
            });
            return;
        }

        var i, result;
        var valid = true;
        const operations = this.state.operations;
        const newOperations = [];
        for (i = 0; i < operations.length; i++) {
            if (!operations[i].valid) {
                newOperations.push(operations[i]);
                valid = false;
                continue;
            }

            result = await this.checkAddress(operations[i]);
            if (result === "duplicate") {
                valid = false;
                newOperations.push({
                    ...operations[i],
                    valid: false,
                    result: "invalid",
                    reason: "Duplicate address"
                });

                continue;
            }

            let set = new Set(result);
            if (set.has(false)) {
                valid = false;
                newOperations.push({
                    ...operations[i],
                    valid: false,
                    result: "invalid",
                    reason: operations[i].type === ca ? addressAlreadyExistReason : operations[i].type === tf ? receiverNotExistReason : invalidCommandReason
                })
            }
            else {
                newOperations.push(operations[i]);
            }
        }

        if (!valid) {
            this.setState({
                operations: newOperations,
                valid: false,
                reason: "생성하려는 주소가 이미 존재하거나 송금하려는 주소가 존재하지 않습니다. 작업을 시작할 수 없습니다."
            });
            return;
        }

        this.setState({
            reason: "작업을 전송 중입니다. 전송 중 다른 페이지로 이동하지 마십시오.",
            running: true,
            showParsed: false,
            valid: true,
        });
        this.sendAll();
    }

    checkAmounts() {
        const operations = this.state.operations;
        const currencies = this.props.account.balances.map(x => ({ ...x, amount: bigInt(x.amount) }));

        const total = {};
        var currency, amount;
        operations.forEach(
            x => {
                x.operation.fact.items.forEach(
                    item => {
                        item.amounts.forEach(
                            z => {
                                currency = z.currency;
                                amount = z.amount;

                                if (!Object.prototype.hasOwnProperty.call(total, currency)) {
                                    total[currency] = bigInt(0);
                                }

                                total[currency] = bigInt(amount).add(total[currency]);
                            }
                        )
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

    async checkAddress(operation) {
        const target = [];
        const addresses = [];

        const generator = new Generator("");
        var keys;

        if (!operation.valid) {
            target.push(this.addressExist(null, null));
        }
        else {
            operation.operation.fact.items.forEach(
                x => {
                    switch (operation.type) {
                        case ca:
                            keys = x.keys.keys.map(k => generator.formatKey(k.key, k.weight));
                            keys = generator.createKeys(keys, parseInt(x.keys.threshold));
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
        }

        const addressSet = new Set(addresses);
        if (addressSet.size !== addresses.length) {
            return "duplicate";
        }

        return await Promise.all(target);
    }

    async addressExist(address, type) {
        if (!address || !type) {
            return false;
        }

        return await axios.get(this.props.network + "/account/" + address)
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

    async send(operation) {
        return await axios.post(this.props.networkBroadcast, operation);
    }

    async sendAll() {
        const operations = this.state.operations;

        operations.forEach(
            async (x, idx) => {
                await Sleep(4000 * idx);
                this.send(x.operation)
                    .then(
                        res => {
                            const isFin = this.state.result.length >= this.state.operations.length - 1;

                            this.setState({
                                running: isFin ? false : true,
                                reason: isFin ? "전송이 완료되었습니다." : this.state.reason,
                                result: [...this.state.result, { idxs: x.idxs, hash: x.operation.fact.hash, result: "pending" }],
                            });
                        }
                    )
                    .catch(
                        e => {
                            const isFin = this.state.result.length >= this.state.operations.length - 1;

                            this.setState({
                                running: isFin ? false : true,
                                reason: isFin ? "전송이 완료되었습니다." : this.state.reason,
                                result: [...this.state.result, { idxs: x.idxs, hash: x.operation.fact.hash, result: "fail" }]
                            });
                        }
                    );
            }
        )
    }

    async lookup() {
        const result = this.state.result;
        this.setState({
            running: true,
        });

        var running = true;
        var looked = result.map(x => false);
        var lookSet;
        while (running) {
            result.forEach(
                async (x, idx) => {
                    if (looked[idx]) {
                        return;
                    }

                    await axios.get(this.props.networkSearchFact + x.hash)
                        .then(
                            res => {
                                const newRes = this.state.result;
                                if (res.data._embedded.in_state) {
                                    newRes[idx] = { ...newRes[idx], result: "success" }
                                }
                                else {
                                    newRes[idx] = { ...newRes[idx], result: "fail" }
                                }
                                this.setState({
                                    result: newRes,
                                });

                                looked[idx] = true;
                            }
                        )
                        .catch(
                            e => { }
                        )
                }
            );

            await Sleep(1000);

            lookSet = new Set(looked);
            if (!lookSet.has(false)) {
                break;
            }
        }

        this.setState({
            running: false,
        });
    }

    render() {
        const { operations, running, reason, result, valid } = this.state;

        return (
            <div className="send-bulk-container">
                <h1>Send Multiple Operations</h1>
                <section id="bulk-input">
                    <p id="exp">이 페이지에서 생성/서명한 대용량 작업 파일만 사용 가능합니다.</p>
                    <ReactFileReader handleFiles={this.readJson} fileTypes={'.json'}>
                        <button id="import-button">파일 가져오기</button>
                    </ReactFileReader>
                </section>
                <section id="bulk-text">
                    <p>{operations.length < 1 && !reason ? "불러온 대용량 작업이 없습니다." : reason ? reason : "이제 전송을 시작할 수 있습니다."}</p>
                </section>
                <div id="bulk-button">
                    <ul>
                        <li key="start">
                            <button
                                style={operations.length > 0 && !running && operations.length > result.length && valid
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={operations.length > 0 && !running ? false : true}
                                onClick={() => this.startSend()}>전송 시작</button>
                            <p>{`대용량 작업 전송을 시작합니다.`}</p>
                        </li>
                        <li key="cancel">
                            <button
                                style={operations.length > 0 && !running
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={operations.length > 0 && !running ? false : true}
                                onClick={() => this.clear()}>초기화</button>
                            <p>{`로딩된 모든 작업 내용을 초기화합니다.`}</p>
                        </li>
                        <li id="lookup">
                            <button
                                style={!(operations.length > 0 && !running && operations.length <= result.length)
                                    ? { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" } : { opacity: "1.0" }}
                                disabled={!(operations.length > 0 && !running && operations.length <= result.length) ? true : false}
                                onClick={() => this.lookup()}>결과 조회</button>
                            <p>{`전송 도중에는 이 페이지에서 작업 처리 결과를 조회할 수 없습니다. 다른 페이지로 이동 시 조회가 중단됩니다.`}</p>
                        </li>
                    </ul>
                </div>
                <div className="bulk-main">
                    <p id="exp">{this.state.showParsed ? "작업 내역" : "전송 내역"}</p>
                    {this.state.showParsed ? <CSVResult isOperation={true} csvs={operations} />
                        : <BroadcastResult csvs={null} broadcasted={this.state.result} isCSV={false} />}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    account: state.login.account,
    network: state.network.network,
    networkBroadcast: state.network.networkBroadcast,
    networkSearchFact: state.network.networkSearchFact,
});

export default connect(
    mapStateToProps,
    null
)(SendBulk);