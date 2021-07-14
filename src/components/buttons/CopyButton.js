import React from 'react';
import PropTypes from 'prop-types';

import './CopyButton.scss';

class CopyButton extends React.Component {
    render() {
        return (
            <button className="copy-button" onClick={this.props.onClick}
                style={{ display: this.props.visible ? "inherit" : "none" }}>
                COPY
            </button>
        );
    }
}

CopyButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired
}

export default CopyButton;