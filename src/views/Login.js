import React from 'react';
import './Login.scss';

import PrivateKeyLoginBox from '../components/PrivateKeyLoginBox';
import RestoreKeyLoginBox from '../components/RestoreKeyLoginBox';

const MODE_PRIV_KEY = 'MODE_PRIV_KEY';
const MODE_RES_KEY = 'MODE_RES_KEY';

class Login extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            mode: MODE_PRIV_KEY,
            isPriv: true,
            isActive: false
        }
        
        this.renderForm = this.renderForm.bind(this);
    }

    onChange() {
		const radio = document.querySelector("input[type=radio]:checked").value;

        if(this.state.isActive){
            this.setState({
                mode: radio
            });
        }
        else return;
	}

	renderForm() {
		const { mode } = this.state;
		switch (mode) {
			case MODE_PRIV_KEY: 
				return	<PrivateKeyLoginBox />
			case MODE_RES_KEY:
				return	<RestoreKeyLoginBox />;
			default:
				return	<PrivateKeyLoginBox />;
		}
	}

    onClick() {
        if(this.state.isActive){
            this.setState({
                isPriv: !this.state.isPriv
            });
        }
        else return;
    }

    render() {
        return (
            <div className="login-container">
                <div className="login-radio">
                    <label className="rad-label">
                        <input type="radio" className="rad-input" value={MODE_PRIV_KEY} name="rad" 
                            onChange={() => this.onChange()} onClick={() => this.onClick()} checked={this.state.isPriv}/>
                        <div className="rad-design"></div>
                        <div className="rad-text">Private Key</div>
                    </label>

                    <label className="rad-label">
                        <input type="radio" className="rad-input" value={MODE_RES_KEY} name="rad"
                            onChange={() => this.onChange()} onClick={() => this.onClick()} checked={!this.state.isPriv}/> 
                        <div className="rad-design"></div>
                        <div className="rad-text">Restore Key</div>
                    </label>
                </div>
                { this.renderForm() }
            </div>
        );
    }
}

export default Login;