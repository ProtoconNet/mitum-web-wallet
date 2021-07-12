import React from 'react';
import PropTypes from 'prop-types';

import './SelectButton.scss';

class SelectButton extends React.Component {
    render() {
        return (
            <button className={"select-button " + this.props.size}
                onClick={this.props.onClick}>
                <span>{this.props.children}</span>
            </button>
        );
    }
}

SelectButton.propTypes = {
    size: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
}

export default SelectButton;