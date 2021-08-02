import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import axios from 'axios';

import './UpdateKeyLoad.scss';
import { connect } from 'react-redux';
import { setResponse } from '../store/actions';

class UpdateKeyLoad extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRedirect: false,
            counter: 0,
        }
    }

    renderRedirect() {
        if (this.state.isRedirect) {
            return (
                <Redirect to='/response' />
            )
        }
    }

    getResponse() {
        if (this.state.counter < 50) {
            const { data, res, isBroadcast } = this.props;

            const getResult = async (_hash, _res, isBroadcast) => {
                return await axios.get(process.env.REACT_APP_API_SEARCH_FACT + _hash)
                    .then(
                        response => {
                            if (response.data._embedded.in_state) {
                                this.props.setResult(true, true, _res, 200, _hash);
                                this.setState({
                                    isRedirect: true,
                                });
                            }
                            else {
                                this.props.setResult(true, false, {
                                    title: response.data._embedded.reason.msg
                                }, 400, _hash);
                                this.setState({
                                    isRedirect: true,
                                })
                            }
                        }
                    )
                    .catch(
                        e => {
                            if (e.response.data.status === 404) {
                                this.setState({
                                    counter: this.state.counter + 1
                                })
                            }
                            else {
                                this.props.setResult(true, false, e.response.data, 400, _hash);
                                this.setState({
                                    isRedirect: true,
                                });
                            }
                        }
                    )
            }

            setTimeout((hs, rs, broad) => {
                getResult(hs, rs, broad);
            }, 2000, data, res, isBroadcast);

            return () => this.getResponse();
        }
        else {
            this.props.setResult(true, false, {
                title: "Too long time to stay response. Maybe mitum failed to process your operation. :("
            }, 400, this.props.data);
            this.setState({
                isRedirect: true,
            });
        }
    }

    componentDidMount() {
        this.getResponse();
    }

    render() {
        return (
            <div className="load-container">
                {this.renderRedirect()}
                <section className="load-detail">
                    <h1>Loading...</h1>
                    <p>{"키 업데이트 성공 여부를 조회 중입니다. 잠시만 기다려주세요! >~<"}</p>
                    <p>{`REQUEST COUNT: ${this.state.counter}`}</p>
                </section>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    data: state.operation.data,
    res: state.operation.res,
    status: state.operation.status,
});

const mapDispatchToProps = dispatch => ({
    setResult: (isBroadcast, isStateIn, res, status, data) => dispatch(setResponse(isBroadcast, isStateIn, res, status, data)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(UpdateKeyLoad));