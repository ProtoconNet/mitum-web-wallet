import React from 'react';
import PropTypes from 'prop-types';
import './InputBox.scss';
import CopyButton from './buttons/CopyButton';
import copy from 'copy-to-clipboard';

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
            <div className="box">
                <input className={'input-box ' + this.props.size}
                    type="text"
                    name="input-box"
                    value={this.state.value ? this.state.value : this.props.value}
                    disabled={this.props.disabled}
                    onChange={this.props.onChange ? this.props.onChange : () => this.onChange()}
                    placeholder={this.props.placeholder ? this.props.placeholder : ""} />
                <CopyButton visible={this.props.useCopy}
                    onClick={() => {
                        copy(this.props.value);
                        alert('copied!');
                    }} />
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
    placeholder: PropTypes.string
}

export default InputBox;