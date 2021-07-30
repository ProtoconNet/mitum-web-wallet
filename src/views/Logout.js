import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { logout, clearHistory } from '../store/actions';

import './Logout.scss';

class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.props.signOut();
        this.props.clearHistory();
    }
    
    render() {
        return !this.props.isLogin
            ? <Redirect to="/login" />
            : <span>WAIT...</span>;
    }

}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin
});

const mapDispatchToProps = dispatch => ({
    signOut: () => dispatch(logout()),
    clearHistory: () => dispatch(clearHistory())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Logout);