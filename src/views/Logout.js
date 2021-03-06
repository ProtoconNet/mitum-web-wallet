import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { logout, clearHistory, clearQueue, rejectLogin, clearCsvs } from '../store/actions';

import './Logout.scss';

class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.props.signOut();
        this.props.clearHistory();
        this.props.clearQueue();
        this.props.rejectLogin();
        this.props.clearCsv();
    }
    
    render() {
        if(!this.props.isLogin) {
            return <Redirect to="/login" />;
        }

        return <span>WAIT...</span>;
    }

}

const mapStateToProps = state => ({
    isLogin: state.login.isLogin
});

const mapDispatchToProps = dispatch => ({
    signOut: () => dispatch(logout()),
    clearHistory: () => dispatch(clearHistory()),
    clearQueue: () => dispatch(clearQueue()),
    rejectLogin: () => dispatch(rejectLogin()),
    clearCsv: () => dispatch(clearCsvs()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Logout);