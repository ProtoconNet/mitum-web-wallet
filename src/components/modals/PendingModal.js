import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import copy from 'copy-to-clipboard';

import "./PublicKeyModal.scss";

const job = (hs) => {
    return (
        <li key={hs}
            onClick={() => {
                copy(hs);
                alert('copied');
            }}>{hs}</li>
    );
}

class PendingModal extends React.Component {

    render() {
        const { isOpen, onClose, queue } = this.props;
        return (
            <div className={isOpen ? 'openModal modal' : 'modal'}>
                {isOpen ? (
                    <section>
                        <header>
                            Operation Facts in Pending...
                            <button className="close" onClick={onClose}> &times; </button>
                        </header>
                        <main>
                            <ul>
                                {queue.queue.map(x => job(x))}
                            </ul>
                        </main>
                    </section>
                ) : null}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    queue: state.queue.queue
});

export default withRouter(connect(
    mapStateToProps,
    null
)(PendingModal));