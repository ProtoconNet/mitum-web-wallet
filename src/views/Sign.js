import React, { createRef } from 'react';
import { Redirect } from 'react-router-dom';
import copy from 'copy-to-clipboard';

import './Sign.scss';

import ConfirmButton from '../components/buttons/ConfirmButton';

import { Signer } from 'mitumc';
import { connect } from 'react-redux';
import OperationConfirm from '../components/modals/OperationConfirm';

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

class Sign extends React.Component {

    constructor(props) {
        super(props);

        this.createdRef = createRef();
        this.infoRef = createRef();
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
            sigs: [],
            download: undefined,
            filename: "",
            type: "",

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
            this.infoRef.current.scrollIntoView({behavior : 'smooth'});
        }
        else if (this.createdRef.current) {
            this.createdRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    jsonView() {
        return (
            <div className="sign-json">
                {this.state.json
                    ? (
                        <pre style={preStyle}
                            onClick={() => onCopy(JSON.stringify(this.state.json, null, 4))}>
                            {JSON.stringify(this.state.json, null, 4)}
                        </pre>
                    ) : false}
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
                        json: parsed,
                        type: parsed._hint,
                        download: download(parsed),
                        filename: parsed.hash,
                        sigs: parsed.fact_signs.map(x => x.signature)
                    });
                }
            };
            reader.readAsText(file, "utf-8");
        } catch (e) {
            this.setState({
                json: json,
                type: json._hint,
                download: download(json),
                filename: Object.prototype.hasOwnProperty.call(json, 'hash') ? json.hash : "",
                sigs: Object.prototype.hasOwnProperty.call(json, 'fact_signs') ? json.fact_signs.map(x => x.signature) : []
            });
            alert('Invalid format!\nOnly operation json file can be imported');
        }
    }

    onClickSend() {
        const target = this.state.json;
        if (!Object.prototype.hasOwnProperty.call(target, 'hash') || !Object.prototype.hasOwnProperty.call(target, 'fact')
            || !Object.prototype.hasOwnProperty.call(target, 'fact_signs') || !Object.prototype.hasOwnProperty.call(target, 'memo')) {
            alert('Invalid operation!')
            return;
        }

        if (!this.state.download) {
            return;
        }

        this.setState({
            isModalOpen: true
        })
    }

    onClickSign() {

        let target = this.state.json;

        if (!Object.prototype.hasOwnProperty.call(target, 'hash') || !Object.prototype.hasOwnProperty.call(target, 'fact_signs')
            || !Object.prototype.hasOwnProperty.call(target, 'fact') || !Object.prototype.hasOwnProperty.call(target, 'memo')) {
            return;
        }

        const signer = new Signer(process.env.REACT_APP_NETWORK_ID, this.props.account.privateKey);

        try {
            const json = signer.signOperation(target);
            this.setState({
                json: json,
                type: json._hint,
                download: download(json),
                filename: json.hash,
                sigs: json.fact_signs.map(x => x.signature)
            });
            alert('Success!');
        }
        catch (e) {
            this.setState({
                json: target,
                type: Object.prototype.hasOwnProperty.call(target, '_hint') ? target._hint : "",
                download: download(target),
                filename: target.hash,
                sigs: target.fact_signs.map(x => x.signature)
            })
            alert('Could not add sign to operation');
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
                <div className="sign-account">
                    <p>{this.props.account.address}</p>
                </div>
                <div ref={this.infoRef} />
                <div className="sign-operation">
                    <div className="sign-info">
                        <span id="other">
                            <p id="head">FACT HASH</p>
                            <p id="body">
                                {
                                    this.state.json && Object.prototype.hasOwnProperty.call(this.state.json, 'fact')
                                        ? this.state.json.fact.hash
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
                                        <li style={{textAlign: "center"}}>-</li>
                                    )
                                }
                            </ul>
                        </span>
                    </div>
                    <div ref={this.jsonRef} />
                    {this.state.json 
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
                    <ConfirmButton onClick={() => this.onClickSend()}>SEND</ConfirmButton>
                    <ConfirmButton onClick={() => this.onClickSign()}>SIGN</ConfirmButton>
                </div>
                <OperationConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}
                    title="Are you sure?"
                    json={this.state.json}
                    filename={this.state.filename}
                    download={this.state.download} />
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