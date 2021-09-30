import React from 'react';
import './Home.scss';

import logo_trans from '../image/logo_trans.png';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRedirect: false
        };
    }

    onClick() {
        if(this.props.maintain.maintain) {
            return;
        }

        this.setState({
            isRedirect: true
        });
    }

    render() {
        if (this.state.isRedirect) {
            return <Redirect to="/login" />;
        }

        return (
            <div className="home-container">
                <div className="home-wrapper"
                    onClick={() => this.onClick()}>
                    <div className="home-title-wrapper">
                        <img src={logo_trans} alt="logo" />
                        <div className="home-title">
                            <h1>MITUM WEB WALLET</h1>
                        </div>
                    </div>
                    <div className="home-open">OPEN WALLET</div>
                    {
                        this.props.maintain.maintain
                            ? <div className="home-maintain">
                                <div dangerouslySetInnerHTML={{ __html: this.props.maintain.msg.ko }} />
                                <div id="end-time">
                                    {`Untill ${this.props.maintain.end}`}
                                </div>
                            </div>
                            : null
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    maintain: state.maintain
});

export default withRouter(connect(
    mapStateToProps,
    null
)(Home));