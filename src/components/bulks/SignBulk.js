import React, { Component } from 'react';
import './SignBulk.scss';

import ReactFileReader from 'react-file-reader';
import { connect } from 'react-redux';
import { addAllSign, clearMultiOperations, setMultiOperations } from '../../store/actions';
import CreateResult from './CreateResult';
import { isOperation } from '../../lib/Validation';

class SignBulk extends Component {
    constructor(props) {
        super(props);

        this.state = {
            running: false,
            reason: "",
            result: [],
            operations: [],

            valid: true,

            download: null,
            filename: "",
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
            this.props.setOpers(operations);
            this.parseOperations(operations);
        }
        reader.readAsText(files[0]);
    }

    parseOperations(operations) {
        const checked = operations.map(
            x => {
                if (isOperation(x)) {
                    return {
                        operation: x,
                        idxs: [],
                        result: "valid",
                    }
                }
                else {
                    return {
                        operation: x,
                        idxs: [],
                        result: "invalid",
                    }
                }
            }
        );

        const resultSet = new Set(checked.map(x => x.result));

        this.setState({
            operations: checked,
            valid: !resultSet.has("invalid"),
        });
    }

    async startSign() {
        this.setState({
            running: true,
            reason: "서명 중입니다. 서명 중 다른 페이지로 이동하지 마십시오."
        });

        await this.props.addSigns(this.props.beforeSign, this.props.networkId, this.props.priv);

        this.setState({
            running: false,
            reason: "서명을 완료하였습니다.",
            result: this.props.afterSign.map(x => ({ operation: x.operation, idxs: [], result: x.result })),
            download: this.download(),
            filename: "signed_" + Date.now().toFixed(),
            showParsed: false,
        });
    }

    download() {
        const operations = this.props.afterSign.map(x => x.operation);
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
        this.props.clearOpers();
        this.setState({
            running: false,
            reason: "",
            result: [],
            operations: [],
            download: null,
            filename: "",
            showParsed: true,
            valid: false,
        })
    }

    render() {
        const { beforeSign } = this.props;
        const { running, reason, result, valid } = this.state;

        return (
            <div className="sign-bulk-container">
                <h1>Sign Multiple Operations</h1>
                <section id="bulk-input">
                    <p id="exp">이 페이지에서 생성한 대용량 작업 파일만 사용 가능합니다.</p>
                    <ReactFileReader handleFiles={this.readJson} fileTypes={'.json'}>
                        <button id="import-button">파일 가져오기</button>
                    </ReactFileReader>
                </section>
                <section id="bulk-text">
                    <p>{beforeSign.length < 1 && !reason ? "불러온 대용량 작업이 없습니다." : reason ? reason : "이제 서명을 시작할 수 있습니다."}</p>
                </section>
                <div id="bulk-button">
                    <ul>
                        <li key="start">
                            <button
                                style={beforeSign.length > 0 && !running && beforeSign.length > result.length && valid
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={beforeSign.length > 0 && !running ? false : true}
                                onClick={() => this.startSign()}>서명 시작</button>
                            <p>{`대용량 작업 서명을 시작합니다.`}</p>
                        </li>
                        <li key="cancel">
                            <button
                                style={beforeSign.length > 0 && !running
                                    ? { opacity: "1.0" } : { opacity: "0.6", backgroundColor: "white", color: "black", textDecoration: "line-through" }}
                                disabled={beforeSign.length > 0 && !running ? false : true}
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
                    <p id="exp">{this.state.showParsed ? "작업 내역" : "서명 내역"}</p>
                    {this.state.showParsed ? <CreateResult csvs={null} created={this.state.operations} isNew={false} showContains={false} />
                        : <CreateResult csvs={null} created={this.state.result} isNew={true} showContains={false} />}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    csv: state.bulk.csv,
    beforeSign: state.bulk.beforeSign,
    afterSign: state.bulk.afterSign,
    account: state.login.account,
    priv: state.login.priv,
    network: state.network.network,
    networkId: state.network.networkId,
});

const mapDispatchToProps = dispatch => ({
    setOpers: opers => dispatch(setMultiOperations(opers)),
    clearOpers: () => dispatch(clearMultiOperations()),
    addSigns: (opers, id, priv) => dispatch(addAllSign(opers, id, priv)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SignBulk);