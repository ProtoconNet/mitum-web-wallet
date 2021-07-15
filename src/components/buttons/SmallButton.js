import React from 'react';
import PropTypes from 'prop-types';

import './SmallButton.scss';

function SmallButton(props) {
    return (
        <button className="small-button draw-border"
            style={{ display: props.visible ? "inherit" : "none" }}
            onClick={props.onClick}>
            {props.children}
        </button>
    );
}

SmallButton.propTypes = {
    onClick: PropTypes.func.isRequired
}

export default SmallButton;