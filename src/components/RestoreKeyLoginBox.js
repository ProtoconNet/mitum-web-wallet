import { sha3_256 } from "js-sha3";
import React from "react";
import "./RestoreKeyLoginBox.scss";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { isRestoreKeyValid } from "../lib/Validation";
import ConfirmButton from "./buttons/ConfirmButton";
import InputBox from "./InputBox";
import AlertModal from "./modals/AlertModal";

import CryptoJS from "crypto-js";

class RestoreKeyLoginBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      restoreKey: "",

      isAlertOpen: false,
      alertTitle: "",
      alertMsg: "",
    };
  }

  openAlert(title, msg) {
    this.setState({
      isAlertOpen: true,
      alertTitle: title,
      alertMsg: msg,
    });
  }

  closeAlert() {
    this.setState({
      isAlertOpen: false,
    });
  }

  onChangeRestore(e) {
    this.setState({
      restoreKey: e.target.value,
    });
  }

  loginIfValid() {
    const target = sha3_256
      .create()
      .update(this.props.priv + this.state.restoreKey.trim())
      .hex();
    const verify = this.props.verify;

    if (target !== verify) {
      this.openAlert("지갑 열기 실패! :(", "잘못된 비밀번호입니다.");
    } else {
      const decrypted = CryptoJS.AES.decrypt(
        this.props.priv,
        this.state.restoreKey.trim()
      ).words;
      
      let priv = "";
      let byteArray = [];
      let word, i, j;
      for (i = 0; i < decrypted.length; i++) {
        word = decrypted[i];
        for (j = 3; j >= 0; j--) {
          byteArray.push((word >> (8 * j)) & 0xff);
        }
      }
      for (i = 0; i < byteArray.length; i++) {
        priv += escape(String.fromCharCode(byteArray[i]));
      }

      const idx = priv.indexOf(process.env.REACT_APP_VERSION);
      priv = priv.substring(0, idx + process.env.REACT_APP_VERSION.length);
      // priv = priv.replace('%3A', ':');

      this.props.onLogin(priv);
    }
  }

  render() {
    return (
      <div className="restore-key-container">
        {this.props.isRestoreKeyExist ? (
          <div id="res-exist">
            <div className="res-input-container">
              <InputBox
                disabled={false}
                useCopy={false}
                size="big"
                isPw={true}
                onChange={(e) => this.onChangeRestore(e)}
                value={this.state.restoreKey}
                placeholder="restore password"
                label="restore password"
              />
            </div>
            <ConfirmButton
              disabled={
                !(
                  this.state.restoreKey &&
                  isRestoreKeyValid(this.state.restoreKey)
                )
                  ? true
                  : false
              }
              onClick={() => this.loginIfValid()}
            >
              Open
            </ConfirmButton>
          </div>
        ) : (
          <div id="res-not">
            <h2>로컬에서 키를 찾을 수 없습니다.</h2>
            <ul>
              <li>지갑 열기 후 복구 비밀번호를 설정할 수 있습니다.</li>
              <li>
                로컬 스토리지의 복구 비밀번호는 지갑 열기 후 삭제할 수 있습니다.
              </li>
            </ul>
          </div>
        )}
        <AlertModal
          isOpen={this.state.isAlertOpen}
          onClose={() => this.closeAlert()}
          title={this.state.alertTitle}
          msg={this.state.alertMsg}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isRestoreKeyExist: state.restore.isSet,
  priv: state.restore.priv,
  verify: state.restore.verify,
});

export default withRouter(connect(mapStateToProps, null)(RestoreKeyLoginBox));
