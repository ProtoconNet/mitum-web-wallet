import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import SmallButton from '../components/buttons/SmallButton';
import InputBox from '../components/InputBox';
import AlertModal from '../components/modals/AlertModal';
import { clearNetwork, clearNetworkId, setNetwork, setNetworkId } from '../store/actions';
import './NetworkSetter.scss';

class NetworkSetter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isAlertOpen: false,
            alertTitle: '',
            alertMsg: '',

            network: this.props.network,
            networkId: this.props.networkId,
        }
    }

    setNetwork() {
        this.props.setNetwork(this.state.network);
        this.openAlert("네트워크 주소 변경 성공! :D", `현재 네트워크 주소: ${this.state.network}`);
    }

    setNetworkId() {
        this.props.setNetworkId(this.state.networkId);
        this.openAlert("네트워크 ID 변경 성공! :D", `현재 네트워크 ID: ${this.state.networkId}`);
    }

    clearNetwork() {
        this.props.clearNetwork();
        this.openAlert("네트워크 주소 변경 성공! :D", `현재 네트워크 주소: ${process.env.REACT_APP_API_URL}`);
    }

    clearNetworkId() {
        this.props.clearNetworkId();
        this.openAlert("네트워크 ID 변경 성공! :D", `현재 네트워크 ID: ${process.env.REACT_APP_NETWORK_ID}`);
    }

    onNetworkChange(e) {
        this.setState({
            network: e.target.value
        });
    }

    onNetworkIdChange(e) {
        this.setState({
            networkId: e.target.value
        });
    }

    openAlert(title, msg){
        this.setState({
            isAlertOpen: true,
            alertTitle: title,
            alertMsg: msg,
        });
    }

    closeAlert() {
        this.setState({
            isAlertOpen: false,

            network: this.props.network,
            networkId: this.props.networkId
        })
    }

    render() {
        return (
            <div className="network-container">
                <h1>SETTING</h1>
                <div className="network-setter setter">
                    <h2>SET NETWORK</h2>
                    <section id="network-adder">
                        <InputBox size="medium" useCopy={false} disabled={false} placeholder="network address"
                            value={this.state.network}
                            onChange={(e) => this.onNetworkChange(e)} />
                        <SmallButton
                            visible={true}
                            disabled={false}
                            onClick={() => this.setNetwork()}>SET</SmallButton>
                        <SmallButton
                            visible={true}
                            disabled={false}
                            onClick={() => this.clearNetwork()}>RESET</SmallButton>
                    </section>
                </div>
                <div className="network-id-setter setter">
                    <h2>SET NETWORK ID</h2>
                    <section id="network-id-adder">
                        <InputBox size="medium" useCopy={false} disabled={false} placeholder="network id"
                            value={this.state.networkId}
                            onChange={(e) => this.onNetworkIdChange(e)} />
                        <SmallButton
                            visible={true}
                            disabled={false}
                            onClick={() => this.setNetworkId()}>SET</SmallButton>
                        <SmallButton
                            visible={true}
                            disabled={false}
                            onClick={() => this.clearNetworkId()}>RESET</SmallButton>
                    </section>
                </div>
                <div className="network-version-info">
                    <h2>CURRENT VERSION</h2>
                    <p>{`(FIXED) ${process.env.REACT_APP_VERSION}`}</p>
                </div>
                <AlertModal isOpen={this.state.isAlertOpen} onClose={() => this.closeAlert()}
                    title={this.state.alertTitle} msg={this.state.alertMsg} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    network: state.network.network,
    networkId: state.network.networkId,
});

const mapDispatchToProps = dispatch => ({
    setNetwork: (network) => dispatch(setNetwork(network)),
    setNetworkId: (networkId) => dispatch(setNetworkId(networkId)),
    clearNetwork: () => dispatch(clearNetwork()),
    clearNetworkId: () => dispatch(clearNetworkId()),
});

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(NetworkSetter));