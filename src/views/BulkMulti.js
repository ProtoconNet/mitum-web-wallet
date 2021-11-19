import React, { Component } from 'react';
import CreateBulk from '../components/bulks/CreateBulk';
import SendBulk from '../components/bulks/SendBulk';
import SignBulk from '../components/bulks/SignBulk';
import './BulkMulti.scss';

const switchMode = { create: "create", sign: "sign", transfer: "transfer" };

class BulkMulti extends Component {

    constructor(props) {
        super(props);

        this.state = {
            mode: switchMode.create,
        }
    }

    render() {
        const { mode } = this.state;
        const createStyle = mode === switchMode.create ? { backgroundColor: "white", color: "black" } : {};
        const signStyle = mode === switchMode.sign ? { backgroundColor: "white", color: "black" } : {};
        const transferStyle = mode === switchMode.transfer ? { backgroundColor: "white", color: "black" } : {};


        return (
            <div className="bulk-multi-container">
                <nav id="switch">
                    <p style={createStyle} onClick={() => this.setState({ mode: switchMode.create })}>생성</p>
                    <p style={signStyle} onClick={() => this.setState({ mode: switchMode.sign })}>서명</p>
                    <p style={transferStyle} onClick={() => this.setState({ mode: switchMode.transfer })}>전송</p>
                </nav>
                <div id="mode-container">
                    {mode === switchMode.create ? <CreateBulk /> : false}
                    {mode === switchMode.sign ? <SignBulk /> : false}
                    {mode === switchMode.transfer ? <SendBulk /> : false}
                </div>
            </div>
        );
    }
}

export default BulkMulti;