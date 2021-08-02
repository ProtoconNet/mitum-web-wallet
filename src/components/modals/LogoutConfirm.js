import React from 'react';
import './LogoutConfirm.scss';
import { connect } from 'react-redux';
import { logout } from '../../store/actions';

class LogoutConfirm extends React.Component {

    onLogout() {
        this.props.signOut();
        this.props.onClose();
    }

    render() {
        const { isOpen } = this.props;
        return (
            <div className={isOpen ? 'logout-openModal logout-modal' : 'logout-modal'}>
                {isOpen ? (
                    <section>
                        <header>
                            Wallet Closed
                            <button className="close" onClick={() => this.onLogout()}> &times; </button>
                        </header>
                        <main>
                            <p id='logout-exp'>지갑이 닫힙니다. 변경된 비밀키로 지갑을 다시 열어주세요.</p>
                            <p id='logout-exp'>* 작업 실패 시에는 기존 비밀키를 사용해야 합니다.</p>
                            <span>
                                <p className="logout-modal-button" id="confirm" onClick={() => this.onLogout()}>확인</p>
                            </span>
                        </main>
                    </section>
                ) : null}
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    signOut: () => dispatch(logout()),
});

export default connect(
    null,
    mapDispatchToProps,
)(LogoutConfirm);