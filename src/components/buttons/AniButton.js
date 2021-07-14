import React from 'react';
import PropTypes from 'prop-types';

import './AniButton.scss';

class AniButton extends React.Component {
	render() {
		return (
			<button className={"ani-button " + this.props.size}
				disabled={this.props.disabled ? true : false}
				onClick={this.props.onClick}
				style={{ opacity: this.props.disabled ? 0.4 : 1.0 }}>
				{this.props.children}
			</button>
		)
	}
}

AniButton.propTypes = {
	onClick: PropTypes.func.isRequired,
	size: PropTypes.string.isRequired,
	disabled: PropTypes.bool
}

export default AniButton;