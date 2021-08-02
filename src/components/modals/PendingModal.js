import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import copy from 'copy-to-clipboard';

import "./PendingModal.scss";
import { OPER_CREATE_ACCOUNT, OPER_TRANSFER } from '../../text/mode';

const job = (x) => {
    return (
        <li key={x.hash}
            onClick={() => { copy(x.hash); alert('copied'); }}>
            <p>{x.broadcastedAt}</p>
            <p>{x.operation === OPER_CREATE_ACCOUNT
                ? 'CREATE-ACCOUNT'
                : (
                    x.operation === OPER_TRANSFER
                        ? 'TRANSFER'
                        : 'UPDATE-KEY'
                )
            }</p>
            <p>{x.hash}</p>
        </li>
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