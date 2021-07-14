import React from 'react';
import PropTypes from 'prop-types';

import './AddButton.scss';

class AddButton extends React.Component {
    render() {
        return (
            <button className="add-button"
                disabled={this.props.disabled ? true : false}
                onClick={this.props.onClick}
                style={{ opacity: this.props.disabled ? 0.4 : 1.0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z" />
                </svg>
            </button>
        );
    }
}

AddButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    diabled: PropTypes.bool
}

export default AddButton;