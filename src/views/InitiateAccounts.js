import axios from 'axios';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import { login } from '../store/actions';

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
                    this.props.signIn(res.data._embedded.address, this.props.priv, this.props.pub, res.data);
                    this.setState({
                        isRedirect: true,
                    })
                }
            )
            .catch(
                e => {
                    alert("계정 변경 실패");
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

        return <div>
            {this.state.isRedirect ? <Redirect to="/login" /> : false}
        </div>;
    }
}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin,
    priv: state.login.priv,
    pub: state.login.pub,
    networkPubAccounts: state.network.networkPubAccounts,
    networkAccount: state.network.networkAccount,
});

const mapDispatchToProps = dispatch => ({
    signIn: (address, priv, pub, data) => dispatch(login(address, priv, pub, data)),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(InitiateAccounts));