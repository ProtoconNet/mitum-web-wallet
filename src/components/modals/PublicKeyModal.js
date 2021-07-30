import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import copy from 'copy-to-clipboard';

import "./PublicKeyModal.scss";

const key = (k) => {
    return (
        <li key={k}
            onClick={() => {
                copy(k);
                alert('copied');
            }}>{k}</li>
    );
}

class PublicKeyModal extends React.Component {

    render() {
        const { isOpen, onClose, account } = this.props;
        return (
            <div className={isOpen ? 'openModal modal' : 'modal'}>
                {isOpen ? (
                    <section>
                        <header>
                            Public Key List
                            <button className="close" onClick={onClose}> &times; </button>
                        </header>
                        <main>
                            <ul>
                                {account.publicKeys.map(x => key(x.key))}
                            </ul>
                        </main>
                    </section>
                ) : null}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    account: state.login.account
});

export default withRouter(connect(
    mapStateToProps,
    null
)(PublicKeyModal));