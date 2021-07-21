import React, { createRef } from 'react';
import { Redirect } from 'react-router-dom';
import copy from 'copy-to-clipboard';

import './Sign.scss';

import SelectButton from '../components/buttons/SelectButton';
import ConfirmButton from '../components/buttons/ConfirmButton';
import SmallButton from '../components/buttons/SmallButton';

import axios from 'axios';

import { Signer } from 'mitumc';
import { connect } from 'react-redux';


const CLEAR_DOWNLOAD = 'clear-download';
const CLEAR_RESPONSE = 'clear-response';

const onCopy = (msg) => {
    copy(msg);
    alert('copied!');
}

const download = (json) => {
    if (!json || !Object.prototype.hasOwnProperty.call(json, 'hash')) {
        return undefined;
    }

    let file;
    try {
        file = new File([JSON.stringify(json, null, 4)], `${json.hash}`, { type: 'application/json' });
    } catch (e) {
        alert('Could not get url');
        return undefined;
    }

    return URL.createObjectURL(file);
}

const broadcast = async (operation) => {
    if (!operation || !Object.prototype.hasOwnProperty.call(operation, 'hash') || !Object.prototype.hasOwnProperty.call(operation, 'memo')
        || !Object.prototype.hasOwnProperty.call(operation, 'fact') || !Object.prototype.hasOwnProperty.call(operation, 'fact_signs')
        || !operation.hash || !operation.fact || !operation.fact_signs) {
        return undefined;
    }

    return await axios.post(process.env.REACT_APP_API_BROADCAST, operation);
}

const preStyle = {
    display: 'block',
    padding: '10px 30px',
    margin: '0',
    overflow: 'visible',
    whiteSpace: "pre-wrap"
}

class Sign extends React.Component {

    constructor(props) {
        super(props);

        this.createdRef = createRef();
        this.responseRef = createRef();
        this.jsonRef = createRef();

        if (!Object.prototype.hasOwnProperty.call(this.props, 'location') || !Object.prototype.hasOwnProperty.call(this.props.location, 'state')
            || !this.props.location || !this.props.location.state || !this.props.isLogin) {
            this.state = {
                isRedirect: true
            }
            return;
        }

        this.state = {
            isRedirect: false,
            json: Object.prototype.hasOwnProperty.call(this.props.location.state, 'json') ? this.props.location.state.json : {},

            jsonSelf: "",
            response: undefined,

            download: undefined,
            filename: ""
        }
    }

    clear(clr) {
        if (clr === CLEAR_DOWNLOAD) {
            this.setState({
                download: undefined,
                filename: "",
            });
        }
        else if (clr === CLEAR_RESPONSE) {
            this.setState({
                response: undefined
            });
        }
    }

    componentDidMount() {
        this.scrollToJSON();
    }

    componentDidUpdate() {
        this.scrollToJSON();
    }

    scrollToJSON = () => {
        if (this.responseRef.current && this.state.response) {
            this.responseRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.jsonRef.current && (this.state.jsonSelf || this.state.json)) {
            this.jsonRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else if (this.createdRef.current && !this.state.response) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    jsonView() {
        return (
            <div className="sign-json">
                {this.state.jsonSelf === ""
                    ? (
                        this.state.json
                            ? (
                                <pre style={preStyle}
                                    onClick={() => onCopy(JSON.stringify(this.state.json, null, 4))}>
                                    {JSON.stringify(this.state.json, null, 4)}
                                </pre>
                            )
                            : false
                    )
                    : <textarea type="text" onChange={(e) => this.onSelfChange(e)} />
                }
            </div>
        );
    }

    importJSON(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        const json = this.state.json;

        try {
            reader.onload = () => {
                const parsed = JSON.parse(reader.result);
                if (!Object.prototype.hasOwnProperty.call(parsed, 'hash') || !Object.prototype.hasOwnProperty.call(parsed, 'fact')
                    || !Object.prototype.hasOwnProperty.call(parsed, 'fact_signs') || !Object.prototype.hasOwnProperty.call(parsed, 'memo')
                    || !parsed.hash || !parsed.fact || !parsed.fact_signs) {
                    alert('Invalid format!\nOnly operation json file can be imported');
                }
                else {
                    this.setState({
                        json: parsed
                    });
                    this.clear(CLEAR_DOWNLOAD);
                    this.clear(CLEAR_RESPONSE);
                }
            };
            reader.readAsText(file, "utf-8");
        } catch (e) {
            this.setState({
                json: json
            });
            alert('Invalid format!\nOnly operation json file can be imported');
        }
    }

    onClickImport() {
        if (this.state.jsonSelf) {
            this.clear(CLEAR_DOWNLOAD);
            this.clear(CLEAR_RESPONSE);
        }

        this.setState({
            jsonSelf: "",
            download: undefined,
            filename: ""
        });
    }

    onClickSelf() {
        if (!this.state.jsonSelf) {
            this.clear(CLEAR_DOWNLOAD);
            this.clear(CLEAR_RESPONSE);
        }

        this.setState({
            jsonSelf: "{\n}",
            download: undefined,
            filename: ""
        })
    }

    onSelfChange(e) {
        this.setState({
            jsonSelf: e.target.value ? e.target.value : "{\n}"
        })
    }

    onClickSend() {
        let target = {};

        if (this.state.jsonSelf) {
            target = JSON.parse(this.state.jsonSelf);
        }
        else if (this.state.json) {
            target = this.state.json;
        }
        else {
            this.setState({
                response: undefined
            });
        }

        if (!Object.prototype.hasOwnProperty.call(target, 'hash') || !Object.prototype.hasOwnProperty.call(target, 'fact')
            || !Object.prototype.hasOwnProperty.call(target, 'fact_signs') || !Object.prototype.hasOwnProperty.call(target, 'memo')) {
            this.setState({
                response: undefined
            });
            return;
        }

        broadcast(target).then(
            res => {
                this.setState({
                    status: res.request.status,
                    response: res.data
                });
            }
        ).catch(e => {
            this.setState({
                status: e.response.status,
                response: e.response.data
            })
            alert('Could not send operation');
        });
    }

    onClickSign() {
        this.clear(CLEAR_RESPONSE);
        this.clear(CLEAR_DOWNLOAD);

        let target = this.state.jsonSelf
            ? JSON.parse(this.state.jsonSelf)
            : (
                this.state.json ? this.state.json : {}
            );

        if (!Object.prototype.hasOwnProperty.call(target, 'hash') || !Object.prototype.hasOwnProperty.call(target, 'fact_signs')
            || !Object.prototype.hasOwnProperty.call(target, 'fact') || !Object.prototype.hasOwnProperty.call(target, 'memo')) {
            return;
        }

        const signer = new Signer('mitum', this.props.account.privateKey);

        try {
            this.setState({
                json: signer.signOperation(target),
                jsonSelf: ""
            });
            alert('Success!');
        }
        catch (e) {
            alert('Could not add sign to operation');
        }
    }

    _createFile(target) {
        if (!target || !Object.prototype.hasOwnProperty.call(target, 'hash') || !target.hash) {
            throw new Error('Invalid json');
        }
        this.setState({
            download: download(target),
            filename: target.hash
        });
    }

    onCreateFile() {
        try {
            if (this.state.jsonSelf) {
                this._createFile(JSON.parse(this.state.jsonSelf));
                alert('Success!');
            }
            else if (this.state.json) {
                this._createFile(this.state.json);
                alert('Success!');
            }
            else {
                this.setState({
                    download: undefined
                })
            }
        } catch (e) {
            alert('Could not create file!');
        }
    }

    render() {
        const containerStyle = {
            height: !(this.state.response
                || this.state.jsonSelf
                || this.state.json) ? "130vh" : "100%"
        };

        return (
            <div className="sign-container" style={containerStyle}>
                {this.state.isRedirect ? <Redirect to='/login' /> : false}
                <div ref={this.createdRef}></div>
                <h1>SIGN / SEND OPERATION</h1>
                <div className="sign-account">
                    <p>{this.props.account.address}</p>
                </div>
                <div className="sign-operation">
                    <span className="sign-switch">
                        <SelectButton onClick={() => this.onClickImport()} size="big">IMPORTED</SelectButton>
                        <SelectButton onClick={() => this.onClickSelf()} size="big">WRITTEN</SelectButton>
                    </span>
                    <div ref={this.jsonRef}></div>
                    {this.jsonView()}
                    <div className="sign-files">
                        <input type="file" onChange={(e) => this.importJSON(e)} />
                        <SmallButton visible={true} onClick={() => this.onCreateFile()} >to json file</SmallButton>
                    </div>
                    {this.state.download ? <a target="_blank" download={`${this.state.filename}.json`}
                        href={this.state.download} rel="noreferrer">Download</a> : false}
                </div>
                <div className="sign-buttons">
                    <ConfirmButton onClick={() => this.onClickSend()}>SEND NOW</ConfirmButton>
                    <ConfirmButton onClick={() => this.onClickSign()}>ADD SIGN</ConfirmButton>
                </div>
                <div ref={this.responseRef}></div>
                {this.state.response
                    ?
                    <div className="sign-response">
                        <span>{(this.state.status === 200 ? "Broadcast Success" : "Broadcast Fail") + `: ${this.state.status}`}</span>
                        <pre
                            style={preStyle}
                            onClick={() => onCopy(this.state.response)}>
                            {JSON.stringify(this.state.response, null, 4)}
                        </pre>
                    </div> : false}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    account: state.login.account
});

export default connect(
    mapStateToProps,
)(Sign);