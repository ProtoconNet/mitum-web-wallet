import React from 'react';
import './AlertModal.scss';

class AlertModal extends React.Component {

    render() {
        const { isOpen, onClose, title, msg } = this.props;
        return (
            <div className={isOpen ? 'alert-openModal alert-modal' : 'alert-modal'}>
                {isOpen ? (
                    <section>
                        <header>
                            {title}
                            <button className="close" onClick={onClose}> &times; </button>
                        </header>
                        <main>
                            <p id='alert-msg'>{msg}</p>
                        </main>
                    </section>
                ) : null}
            </div>
        )
    }
}

export default AlertModal;