import React from 'react';
import copy from 'copy-to-clipboard';

import PropTypes from 'prop-types';
import './InputBox.scss';

import SmallButton from './buttons/SmallButton';

class InputBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: ""
        };
    }

    onChange(e) {
        this.setState({
            value: e.target.value
        });
    }

    render() {
        return (
            <div className={"box " + this.props.size}>
                <input className='input-box'
                    type={this.props.isPw ? "password" : "text/plain" }
                    name="input-box"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoSave="off"
                    autoFocus="off"
                    style={{
                        textTransform: "none"
                    }}
                    value={this.state.value ? this.state.value : this.props.value}
                    disabled={this.props.disabled}
                    onChange={this.props.onChange ? this.props.onChange : () => this.onChange()}
                    placeholder={this.props.placeholder ? this.props.placeholder : ""} />
                <SmallButton
                    visible={this.props.useCopy}
                    onClick={() => {
                        copy(this.props.value);
                        alert('copied!');
                    }} >COPY</SmallButton>
            </div>
        )
    }
}

InputBox.propTypes = {
    size: PropTypes.string.isRequired,
    useCopy: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    isPw: PropTypes.bool,
}

export default InputBox;