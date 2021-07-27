import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { logout } from '../store/actions';
import copy from 'copy-to-clipboard';

import './Response.scss';

const onCopy = (msg) => {
    copy(msg);
    alert("copied!");
}


const factHash = (hash) => {
    return (
        <li key={hash}>
            <span onClick={() => onCopy(hash)}>{hash}</span>
        </li>
    );
}

class Response extends React.Component {

    constructor(props) {
        super(props);

        const isRedirect =
            Object.prototype.hasOwnProperty.call(this.props, 'location')
            && Object.prototype.hasOwnProperty.call(this.props.location, 'state') && this.props.location.state
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'res') && this.props.location.state.res
            && Object.prototype.hasOwnProperty.call(this.props.location.state, 'status') && this.props.location.state.status;

        if(this.props.location.state.operation === 'UPDATE-KEY'){
            this.props.signOut();
        }
        this.state = {
            isRedirect: !isRedirect,
            isSignOut: this.props.location.state.operation === 'UPDATE-KEY'
        }
    }

    renderResponse() {
        const isRedirect =
        Object.prototype.hasOwnProperty.call(this.props, 'location')
        && Object.prototype.hasOwnProperty.call(this.props.location, 'state') && this.props.location.state
        && Object.prototype.hasOwnProperty.call(this.props.location.state, 'res') && this.props.location.state.res
        && Object.prototype.hasOwnProperty.call(this.props.location.state, 'status') && this.props.location.state.status
        
        if(!isRedirect) {
            this.setState({
                isRedirect: true
            });
            return false;
        }
        
        const { res, status } = this.props.location.state;

        switch (status) {
            case 200:
                return (
                    <section className={"res-detail success"}>
                        <h1>SUCCESS~ :D</h1>
                        <div>
                            <h2>OPERATIONS - FACT HASH</h2>
                            <ul>
                                {res._embedded.operations.map(x => factHash(x.fact.hash))}
                            </ul>
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
                        <p>No Response!</p>
                    </section>
                )
        }
    }

    render() {
        return (
            <div className="res-container">
                {this.state.isRedirect ? <Redirect to='/login' /> : false}
                {this.renderResponse()}
                {this.state.isSignOut ? <p>This wallet has been closed automatically.</p> : false}
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