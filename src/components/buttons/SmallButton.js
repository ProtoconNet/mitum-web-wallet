import React from 'react';
import PropTypes from 'prop-types';

import './SmallButton.scss';

function SmallButton(props) {
    return (
        <button className="small-button draw-border"
            style={{ display: props.visible ? "block" : "none" }}
            disabled={props.disabled ? true : false}
            onClick={props.onClick}>
            {props.children}
        </button>
    );
}

SmallButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    visible: PropTypes.bool,
    disabled: PropTypes.bool
}

export default SmallButton;