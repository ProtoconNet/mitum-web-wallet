import React from 'react';
import PropTypes from 'prop-types';

import './SelectButton.scss';

class SelectButton extends React.Component {
    render() {
        return (
            <button className="select-button"
                onClick={this.props.onClick}>
                {this.props.children}
            </button>
        );
    }
}

SelectButton.propTypes = {
    onClick: PropTypes.func.isRequired
}

export default SelectButton;