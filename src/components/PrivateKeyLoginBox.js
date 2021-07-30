import React from 'react';

import './PrivateKeyLoginBox.scss';

import InputBox from './InputBox';
import ConfirmButton from './buttons/ConfirmButton';

class PrivateKeyLoginBox extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            privateKey: "",
            account: "",
            data: undefined,
        }
    }

    onChangePrivate(e) {
        this.setState({
            privateKey: e.target.value
        });
    }

    onChangeAddress(e) {
        this.setState({
            account: e.target.value
        });
    }

    render() {
        return (
            <div className="private-login-container">
                <div className="private-input-container">
                    <InputBox disabled={false} useCopy={false} size="big"
                        onChange={(e) => { this.onChangeAddress(e) }}
                        value={this.state.account}
                        placeholder="account address" 
                        label="Account Address"/>
                    <InputBox disabled={false} useCopy={false} size="big"
                        onChange={(e) => this.onChangePrivate(e)}
                        value={this.state.privateKey}
                        placeholder="private key"
                        label="Private Key"/>
                </div>
                <ConfirmButton
                    disabled={!(this.state.privateKey && this.state.account) ? true : false}
                    onClick={() => {
                        this.props.onLogin(this.state.account.trim(), this.state.privateKey.trim());
                    }}>Open</ConfirmButton>
            </div>
        )
    }
}
export default PrivateKeyLoginBox;