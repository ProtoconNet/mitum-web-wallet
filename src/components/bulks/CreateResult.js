import React, { Component } from 'react';
import './CreateResult.scss';

import download from '../../lib/Url';

const plainText = {
    color: "white",
    textDecoration: "none",
};

class CreateResult extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShow: this.props.created.map(x => false)
        }
    }

    commandComponent(idx) {
        return (
            <li key={"command" + idx}>
                <p>{this.props.csvs[idx].oper}</p>
            </li>
        )
    }

    listComponent(oper, idx) {
        const { isNew, showContains } = this.props;

        return (
            <li key={idx}>
                <div>
                    <p onClick={isNew && showContains ? () => {
                        const isShow = this.state.isShow;
                        isShow[idx] = !isShow[idx];
                        this.setState({ isShow })
                    } : () => { }}
                        style={isNew && showContains ? {} : plainText}>{idx + 1}</p>
                    <a id="single-download" target="_blank" download={"single_" + oper.operation.fact.hash + ".json"}
                        href={download(oper.operation)} rel="noreferrer"
                        aria-disabled={isNew ? false : true}
                        disabled={isNew ? false : true}
                        style={isNew ? {} : plainText}>{oper.operation.fact.hash}</a>
                    <p>{oper.result}</p>
                </div>
                {
                    this.state.isShow[idx] && isNew && showContains
                        ? (
                            <ul id="idxs">
                                {oper.idxs.map(x => this.commandComponent(x))}
                            </ul>
                        ) : false
                }
            </li>
        )
    }

    render() {
        return (
            <div className="create-result-container">
                <ul>
                    <li key="title">
                        <div>
                            <p style={plainText}>IDX</p>
                            <p style={{ ...plainText, textAlign: "center" }}>FACT HASH</p>
                            <p>{this.props.isNew ? "RESULT" : "VALID"}</p>
                        </div>
                    </li>
                    {this.props.created.map((x, idx) => this.listComponent(x, idx))}
                </ul>
            </div>
        )
    }
}

export default CreateResult;