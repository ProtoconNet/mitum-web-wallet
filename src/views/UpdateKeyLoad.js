import React from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import './UpdateKeyLoad.scss';

class UpdateKeyLoad extends React.Component {

    constructor(props) {
        super(props);

        try {
            const { res, status } = this.props.location.state;
            if (status !== 200) {
                this.state = {
                    isRedirect: true,
                    status: 400,
                    res: res,
                    data: [],
                }
                return;
            }
            this.state = {
                isRedirect: false,
                broadcastFail: false,
                counter: 0,
            }
        }
        catch (e) {
            console.log(e);
            alert('Fact Hash를 조회할 수 없습니다!\n');
        }
    }

    renderRedirect() {
        if (this.state.isRedirect) {
            return (
                <Redirect to={{
                    pathname: '/response',
                    state: {
                        status: this.state.status,
                        res: this.state.res,
                        data: [],
                        operation: 'UPDATE-KEY'
                    }
                }} />
            )
        }
    }

    getResponse() {
        if (this.state.counter < 100) {
            const { data, res } = this.props.location.state;

            const getResult = async (hash, res) => {
                return await axios.get(process.env.REACT_APP_API_SEARCH_FACT + hash)
                    .then(
                        response => {
                            if (response.data._embedded.in_state) {
                                this.setState({
                                    isRedirect: true,
                                    status: 200,
                                    res: res,
                                });
                            }
                            else {
                                this.setState({
                                    isRedirect: true,
                                    status: 400,
                                    res: {
                                        title: response.data._embedded.reason.msg
                                    }
                                });
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
                                this.setState({
                                    isRedirect: true,
                                    status: 400,
                                    res: {
                                        title: "Network Error"
                                    }
                                });
                            }
                        }
                    )
            }

            setTimeout((hs, rs) => {
                getResult(hs, rs);
            }, 5000, data, res);

            return () => this.getResponse();
        }
        else {
            this.setState({
                isRedirect: true,
                status: 400,
                res: {
                    title: "Too long time to stay response. Maybe mitum failed to process your operation. :("
                }
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

export default UpdateKeyLoad;