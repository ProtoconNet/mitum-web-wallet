import axios from 'axios';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import { login, rejectLogin } from '../store/actions';

class InitiateAccounts extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRedirect: false,
        }

        this.run();
    }

    run() {
        this.getPubAccounts(this.props.pub)
            .then(
                res => {
                    if (res.data._embedded == null) {
                        this.props.rejectLogin();
                        this.setState({
                            isRedirect: true,
                        })
                    }

                    return res.data._embedded.map(
                        x => {
                            return x._embedded.address
                        }
                    )[0];
                }
            )
            .then(
                res => {
                    return this.getAccountInformation(res);
                }
            )
            .then(
                res => {
                    if(this.props.isLoginAllowed) {
                        this.props.signIn(res.data._embedded.address, this.props.priv, this.props.pub, res.data);
                    }
                    this.setState({
                        isRedirect: true,
                    })
                }
            )
            .catch(
                e => {
                    console.log("fail login");
                    this.props.rejectLogin();
                    this.setState({
                        isRedirect: true,
                    })
                }
            )
    }

    async getPubAccounts(pub) {
        return await axios.get(`${this.props.networkPubAccounts}${pub}`);
    }

    async getAccountInformation(account) {
        return await axios.get(this.props.networkAccount + account);
    }

    render() {
        if (this.props.isLogin || this.state.isRedirect) {
            <Redirect to="/login" />
        }

        return (
            <div
                style={{
                    width: "100%",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                <h1 style={{fontSize:"50px"}}>Now Loading...</h1>
                {this.state.isRedirect ? <Redirect to="/login" /> : false}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    priv: state.login.priv,
    pub: state.login.pub,
    networkPubAccounts: state.network.networkPubAccounts,
    networkAccount: state.network.networkAccount,

    isLoginAllowed: state.allow.isLoginAllowed,
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, priv, pub, data) => dispatch(login(address, priv, pub, data)),
    rejectLogin: () => dispatch(rejectLogin())
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(InitiateAccounts));