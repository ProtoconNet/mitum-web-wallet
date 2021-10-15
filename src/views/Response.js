import React from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { enqueueOperation, setOperation, setResponse } from '../store/actions';
import copy from 'copy-to-clipboard';

import './Response.scss';
import LogoutConfirm from '../components/modals/LogoutConfirm';
import { OPER_CREATE_ACCOUNT, OPER_DEFAULT, OPER_TRANSFER, OPER_UPDATE_KEY } from '../text/mode';

const onCopy = (msg) => {
    copy(msg);
    alert("copied!");
}

const address = (keyHash) => {
    return (
        <li key={keyHash}>
            <p onClick={() => onCopy(keyHash)}>{keyHash}</p>
        </li>
    )
}

class Response extends React.Component {

    constructor(props) {
        super(props);

        const isSignOut = this.props.operation === OPER_UPDATE_KEY;

        if (!isSignOut && this.props.isBroadcast) {
            this.props.addJob({
                operation: this.props.operation,
                hash: this.props.json.fact.hash,
                broadcastedAt: new Date().toISOString(),
            });
        }

        this.state = {
            isRedirect: false,
            isModalOpen: isSignOut,
            isSignOut,
        }
    }

    closeModal() {
        this.setState({ isModalOpen: false })
    }

    renderResponse() {
        const { res, status, operation, data } = this.props;

        switch (status) {
            case 200:
                return (
                    <section className={"res-detail success"}>
                        {
                            operation === OPER_UPDATE_KEY
                                ? <h1>KEY UPDATE SUCCESS :D</h1>
                                : <h1>BROADCAST SUCCESS :D</h1>
                        }
                        <div id="exp">
                            {operation === OPER_CREATE_ACCOUNT
                                ? (
                                    <section>
                                        <h2>CREATED ADDRESS LIST</h2>
                                        <ul>
                                            {data.map(x => address(x))}
                                        </ul>
                                        <p>지갑 생성 성공 여부는 지갑 페이지에서 확인해주세요.</p>
                                    </section>
                                ) : false
                            }
                            {operation === OPER_TRANSFER
                                ? (
                                    <section>
                                        <p>송금 성공 여부는 지갑 페이지에서 확인해주세요.</p>
                                    </section>
                                )
                                : false
                            }
                        </div>
                    </section>
                )
            case 400:
            case 404:
            default:
                return (
                    <section className={"res-detail fail"}>
                        <h1>{"FAIL... :("}</h1>
                        <p>{Object.prototype.hasOwnProperty.call(res, 'title') ? res.title : "응답을 받지 못했습니다."}</p>
                    </section>
                );
        }
    }

    render() {
        if (this.state.isRedirect) {
            this.props.clearJson();
            return <Redirect to='/login' />;
        }

        return (
            <div className="res-container">
                {this.renderResponse()}
                <LogoutConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()} />
            </div>
        )
    }
}

const mapStateToProps = state => ({
    operation: state.operation.operation,
    json: state.operation.json,
    data: state.operation.data,
    res: state.operation.res,
    status: state.operation.status,
    isStateIn: state.operation.isStateIn,
    isBroadcast: state.operation.isBroadcast
});

const mapDispatchToProps = dispatch => ({
    clearJson: () => dispatch(setOperation(OPER_DEFAULT, {})),
    setResult: (isBroadcast, isStateIn, res, status, data) => dispatch(setResponse(isBroadcast, isStateIn, res, status, data)),
    addJob: (hash) => dispatch(enqueueOperation(hash))
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Response));