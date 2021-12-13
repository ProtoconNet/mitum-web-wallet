import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ConfirmButton from '../components/buttons/ConfirmButton';
import InputBox from '../components/InputBox';
import AlertModal from '../components/modals/AlertModal';
import { isRestoreKeyValid } from '../lib/Validation';
import { clearRestoreKey, setRestoreKey } from '../store/actions';
import './ResKeyGen.scss';

class ResKeyGen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            firstRestore: "",
            secondRestore: "",

            isAlertOpen: false,
            alertTitle: "",
            alertMsg: "",
        }
    }

    openAlert(title, msg) {
        this.setState({
            isAlertOpen: true,
            alertTitle: title,
            alertMsg: msg,

            firstRestore: "",
            secondRestore: "",
        });
    }

    closeAlert() {
        this.setState({
            isAlertOpen: false
        });
    }

    onChangeFirst(e) {
        this.setState({
            firstRestore: e.target.value,
        })
    }

    onChangeSecond(e) {
        this.setState({
            secondRestore: e.target.value,
        })
    }

    setIfValid() {
        if(!isRestoreKeyValid(this.state.firstRestore.trim())) {
            this.openAlert("비밀번호 설정에 실패하였습니다! :(", "잘못된 비밀번호 형식입니다");
            return;
        }

        if(this.state.firstRestore.trim() !== this.state.secondRestore.trim()) {
            this.openAlert("비밀번호 설정에 실패하였습니다! :(", "비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }


        console.log(this.props.priv);
        this.props.setRestoreKey(this.props.priv, this.state.firstRestore.trim());
        this.openAlert("비밀번호 설정 완료! :)", "이제 복구 비밀번호로 지갑을 열 수 있습니다.");
    }

    clearRestoreKey() {
        if(!this.props.isRestoreKeyExist) {
            this.openAlert("저장된 비밀번호가 없습니다!", "기기에 저장된 비밀번호가 없습니다.");
            return;
        }

        this.props.clearRestoreKey();
        this.openAlert("비밀번호가 삭제되었습니다! :)", "비밀번호를 기기에서 삭제하였습니다."); 
    }

    render() {
        return (
            <div className="res-gen-container">
                <h1>SET RESTORE KEY</h1>
                <div id='res-gen-explain'>
                    <h2>비밀번호 생성 규칙</h2>
                    <ul>
                        <li>비밀번호는 8~16자의 문자열로 설정할 수 있습니다.</li>
                        <li>{"사용 가능한 문자는 0-9의 숫자, 알파벳 소문자/대문자 및 특수문자(@!#^&*+)입니다."}</li>
                    </ul>
                </div>
                <div className="res-gen-input">
                    <InputBox
                        isPw={true}
                        disabled={false} useCopy={false} size="big"
                        onChange={(e) => this.onChangeFirst(e)}
                        value={this.state.firstRestore}
                        placeholder="password..."
                        label="password" />
                    <InputBox
                        isPw={true}
                        disabled={false} useCopy={false} size="big"
                        onChange={(e) => this.onChangeSecond(e)}
                        value={this.state.secondRestore}
                        placeholder="verify password..."
                        label="verify password" />
                    <ConfirmButton
                        disabled={!(this.state.firstRestore && this.state.secondRestore) ? true : false}
                        onClick={() => this.setIfValid()}>SET PASSWORD</ConfirmButton>
                </div>
                <p id="clear-res" onClick={() => this.clearRestoreKey()}>REMOVE RESTORE PW FROM THE DEVICE</p>
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    priv: state.login.priv,
    isRestoreKeyExist: state.restore.isSet,
});

const mapDispatchToProps = dispatch => ({
    setRestoreKey: (priv, resKey) => dispatch(setRestoreKey(priv, resKey)),
    clearRestoreKey: () => dispatch(clearRestoreKey()),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(ResKeyGen));