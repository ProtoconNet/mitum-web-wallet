import React from 'react';
import PropTypes from 'prop-types';

import './ConfirmButton.scss';

class ConfirmButton extends React.Component {
    render() {
        return (
            <div className="confirm-button-container ">
                <button className="confirm-button"
                    style={{ opacity: this.props.disabled ? 0.4 : 1.0 }}
                    onClick={this.props.onClick}
                    disabled={this.props.disabled ? true : false}>
                    {this.props.children}
                </button>
            </div>
        );
    }
}

ConfirmButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool
}

export default ConfirmButton;