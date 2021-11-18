import React from 'react';
import './CSVResult.scss';

const plainText = {
    color: "white",
    textDecoration: "none",
};

class CSVResult extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isShow: this.props.csvs.map(x => false)
        }
    }

    listComponent(csv, idx) {
        return (
            <li key={idx}>
                <div>
                    <p onClick={() => {
                        const isShow = this.state.isShow;
                        isShow[idx] = !isShow[idx];
                        this.setState({ isShow })
                    }}
                        style={csv.reason ? {} : plainText}>{idx + 1}</p>
                    <p>{csv.oper}</p>
                    <p>{csv.valid ? "valid" : "invalid"}</p>
                </div>
                {csv.reason && this.state.isShow[idx] ? <p id="reason">{csv.reason}</p> : false}
            </li>
        )
    }

    render() {
        return (
            <div className="csv-result-container">
                <ul>
                    <li key="title">
                        <div>
                            <p style={plainText}>IDX</p>
                            <p style={{ textAlign: "center" }}>COMMAND</p>
                            <p>VALID</p>
                        </div>
                    </li>
                    {this.props.csvs.map((x, idx) => this.listComponent(x, idx))}
                </ul>
            </div>
        )
    }
}

export default CSVResult;