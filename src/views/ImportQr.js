import React, { Component, createRef } from 'react'
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';
import SelectButton from '../components/buttons/SelectButton';
import getOperationFromType from '../lib/Parse';
import { clearPage, setOperation, setPage } from '../store/actions';

import QrReader from 'react-qr-reader';

import './ImportQr.scss';
import { decode } from 'base-64';
import { isOperation } from '../lib/Validation';
import AlertModal from '../components/modals/AlertModal';

class ImportQr extends Component {

    constructor(props) {
        super(props);

        this.props.clearPage();
        this.qrRef = createRef();

        this.state = {
            data: "Not Detected",
            result: "-",
            isRedirect: false,
            isAlertOpen: false,
            alertTitle: "",
            alertMsg: "",

            success: false,
        };
    }

    handleScan(result) {
        if (result) {
            try {
                JSON.parse(decode(decode(result)));
            }
            catch (error) {
                this.setState({
                    data: "Invalid Operation; Maybe this QR Code is not for mitum web wallet.",
                    result: result

                });
                this.openAlert("불러오기 실패.. :(", "유효하지 않은 QR 코드입니다.");
                return;
            }

            const data = decode(decode(result));
            const parsed = JSON.parse(data);

            if (!isOperation(parsed)) {
                this.setState({
                    data: "Invalid Operation; Maybe this QR Code is not for mitum web wallet.",
                    result: result
                });

                this.openAlert("불러오기 실패.. :(", "유효하지 않은 QR 코드입니다.");
                return;
            }
            else {
                const operation = getOperationFromType(parsed._hint);
                this.props.setJson(operation, parsed);
                this.props.setPage();

                this.setState({
                    success: true
                });
                this.openAlert("불러오기 성공! :)", "서명 페이지로 이동합니다.");
                return;
            }
        }

        this.setState({
            result: result
        });
    }

    handleError(error) {
        console.log(error);
    }

    importFile() {
        this.setState({
            data: "Not Detected"
        })
        this.qrRef.current.openImageDialog();
    }

    openAlert(title, msg) {
        this.setState({
            isAlertOpen: true,
            alertTitle: title,
            alertMsg: msg,
        });
    }

    closeAlert() {
        if (this.state.success) {
            this.setState({
                isAlertOpen: false,
                isRedirect: true
            })
        }
        else {
            this.setState({
                isAlertOpen: false,
            })
        }
    }

    render() {

        if (this.state.isRedirect) {
            return <Redirect to="/sign" />
        }

        return (
            <div className="qr-container">
                <QrReader
                    className="qr-reader"
                    delay={300}
                    onError={(e) => this.handleError(e)}
                    onScan={(res) => this.handleScan(res)}
                />
                <QrReader
                    ref={this.qrRef}
                    style={{
                        display: "none"
                    }}
                    className="qr-reader"
                    delay={300}
                    onError={(e) => this.handleError(e)}
                    onScan={(res) => this.handleScan(res)}
                    legacyMode
                />
                <SelectButton id="import-button" size="wide" onClick={() => this.importFile()}>
                    import from file
                </SelectButton>
                <p>{this.state.result}</p>
                <p>{this.state.data}</p>
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    setPage: () => dispatch(setPage()),
    clearPage: () => dispatch(clearPage()),
    setJson: (operation, json) => dispatch(setOperation(operation, json)),
});

export default withRouter(connect(
    null,
    mapDispatchToProps
)(ImportQr));