import React from 'react';
import './BroadcastResult.scss';

const plainText = {
    color: "white",
    textDecoration: "none",
};

function openTab(url) {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
}

class BroadcastResult extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isShow: this.props.broadcasted.map(x => false)
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
        const {isCSV} = this.props;
        return (
            <li key={idx}>
                <div>
                    <p onClick={isCSV ? () => {
                        const isShow = this.state.isShow;
                        isShow[idx] = !isShow[idx];
                        this.setState({ isShow })
                    } : () => {}}
                     style={isCSV ? {} : plainText}>{idx + 1}</p>
                    <p onClick={() => openTab(process.env.REACT_APP_EXPLORER + "/operation/" + oper.hash)}>{oper.hash}</p>
                    <p>{oper.result}</p>
                </div>
                {
                    this.state.isShow[idx] && isCSV
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
            <div className="broadcast-result-container">
                <ul>
                    <li key="title">
                        <div>
                            <p style={plainText}>IDX</p>
                            <p style={{ ...plainText, textAlign: "center" }}>FACT HASH</p>
                            <p>RESULT</p>
                        </div>
                    </li>
                    {this.props.broadcasted.map((x, idx) => this.listComponent(x, idx))}
                </ul>
            </div>
        )
    }
}

export default BroadcastResult;