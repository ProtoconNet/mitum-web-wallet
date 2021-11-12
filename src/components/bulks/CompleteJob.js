import React, { Component } from 'react';
import { connect } from 'react-redux';
import { failText } from '../../store/reducers/BulkReducer';
import './CompleteJob.scss';

const plainTextStyle = {
    textDecoration: "none",
    color: "white",
}

const openTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
}

class CompleteJob extends Component {

    renderOperation(x, idx) {
        // const viewOper = (i) => {
        //     const content = JSON.stringify(this.props.bulks[i], null, 4);

            
        // };

        if (!x.hash) {
            return (
                <li key={Math.random() + ""}>
                    <p>{idx}</p>
                    <p style={plainTextStyle}>invalid; cannot process this operation</p>
                    <p>{failText}</p>
                </li>
            )
        }

        return (
            <li key={x.hash + idx}>
                <p>{idx}</p>
                <p onClick={() => openTab(process.env.REACT_APP_EXPLORER + "/operation/" + x.hash)}>{x.hash}</p>
                <p>{x.result}</p>
            </li>
        )
    }

    render() {
        const columnsStyle = {
            textAlign: 'center',
            backgroundColor: "transparent",
            borderBottom: "2px solid white",
            fontWeight: "400",
            marginLeft: "2px",
            marginRight: "2px",
        };

        return (
            <ul className='complete-ul'>
                <li key="columns">
                    <p style={columnsStyle}>IDX</p>
                    <p style={{ ...columnsStyle, ...plainTextStyle }}>FACT HASH</p>
                    <p style={columnsStyle}>RESULT</p>
                </li>
                {this.props.sent.map((x, idx) => this.renderOperation(x, idx))}
            </ul>
        )
    }
}

const mapStateToProps = state => ({
    bulks: state.bulk.bulks,
});

export default connect(
    mapStateToProps,
    null
)(CompleteJob);