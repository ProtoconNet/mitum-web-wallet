import React from 'react';

import './PrivateKeyLoginBox.scss';

import InputBox from './InputBox';
import ConfirmButton from './buttons/ConfirmButton';
import { isPrivateKeyValid } from '../lib/Validation';

class PrivateKeyLoginBox extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            privateKey: "",
            data: undefined,
        }
    }

    onChangePrivate(e) {
        this.setState({
            privateKey: e.target.value
        });
    }

    render() {
        return (
            <div className="private-login-container">
                <div className="private-input-container">
                    <InputBox disabled={false} useCopy={false} size="big"
                        onChange={(e) => this.onChangePrivate(e)}
                        value={this.state.privateKey}
                        placeholder="private key"
                        label="Private Key"/>
                </div>
                <ConfirmButton
                    disabled={!(this.state.privateKey && isPrivateKeyValid(this.state.privateKey)) ? true : false}
                    onClick={() => {
                        this.props.onLogin(this.state.privateKey.trim());
                    }}>Open</ConfirmButton>
            </div>
        )
    }
}
export default PrivateKeyLoginBox;