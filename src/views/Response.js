import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { logout } from '../store/actions';
import copy from 'copy-to-clipboard';

import './Response.scss';
import LogoutConfirm from '../components/modals/LogoutConfirm';

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

        const isRedirect =
            Object.prototype.hasOwnProperty.call(this.props, 'location')
            && Object.prototype.hasOwnProperty.call(this.props.location, 'state') && this.props.location.state
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'res') && this.props.location.state.res
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'status') && this.props.location.state.status
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'operation') && this.props.location.state.operation
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'data');

        let isSignOut = false;
        if (this.props.location.state.operation === 'UPDATE-KEY') {
            this.props.signOut();
            isSignOut = true;
        }
        this.state = {
            isRedirect: !isRedirect,
            isSignOut,
            isModalOpen: isSignOut 
        }
    }

    closeModal() {
        this.setState({ isModalOpen: false })
    }

    renderResponse() {
        const isRedirect =
            Object.prototype.hasOwnProperty.call(this.props, 'location')
            && Object.prototype.hasOwnProperty.call(this.props.location, 'state') && this.props.location.state
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'res') && this.props.location.state.res
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'status') && this.props.location.state.status
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'operation') && this.props.location.state.operation
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'data');

        if (!isRedirect) {
            this.setState({
                isRedirect: true
            });
            return false;
        }

        const { res, status, operation, data } = this.props.location.state;

        switch (status) {
            case 200:
                return (
                    <section className={"res-detail success"}>
                        {
                            operation === 'UPDATE-KEY'
                            ? <h1>KEY UPDATE SUCCESS~ :D</h1>
                            : <h1>BROADCAST SUCCESS~ :D</h1>
                        }
                        <div>
                            {operation === 'CREATE-ACCOUNT'
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
                            {operation === 'TRANSFER'
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
                return (
                    <section className={"res-detail fail"}>
                        <h1>{"400 FAIL... :("}</h1>
                        <p>{res.title}</p>
                    </section>
                )
            default:
                return (
                    <section className={"res-detail fail"}>
                        <h1>{"FAIL... :("}</h1>
                        <p>응답을 받지 못했습니다.</p>
                    </section>
                )
        }
    }

    render() {
        return (
            <div className="res-container">
                {this.state.isRedirect ? <Redirect to='/login' /> : false}
                {this.renderResponse()}
                <LogoutConfirm isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}/>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    signOut: () => dispatch(logout()),
});

export default connect(
    null,
    mapDispatchToProps,
)(Response);