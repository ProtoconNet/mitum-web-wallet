import React from 'react';
import './Home.scss';

import logo_trans from '../image/logo_trans.png';
import { Redirect } from 'react-router-dom';

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRedirect: false
        };
    }

    onClick() {
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
                </div>
            </div>
        );
    }
}

export default Home;