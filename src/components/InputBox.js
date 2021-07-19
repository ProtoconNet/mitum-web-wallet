import React from 'react';
import PropTypes from 'prop-types';
import './InputBox.scss';
import copy from 'copy-to-clipboard';
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
                    type="text"
                    name="input-box"
                    value={this.state.value ? this.state.value : this.props.value}
                    disabled={this.props.disabled}
                    onChange={this.props.onChange ? this.props.onChange : () => this.onChange()}
                    placeholder={this.props.placeholder ? this.props.placeholder : ""} />
                <SmallButton className="input-copy-button"
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
    placeholder: PropTypes.string
}

export default InputBox;