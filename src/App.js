import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import './App.scss';

import Home from './views/Home';
import Login from './views/Login';
import Wallet from './views/Wallet';
import KeyGen from './views/KeyGen';
import AddressGen from './views/AddressGen';
import ResKeyGen from './views/ResKeyGen';
import Help from './views/Help';
import Operation from './views/Operation';
import Sign from './views/Sign';

import Navigation from './components/Navigation';
import Logout from './views/Logout';
import NetworkSetter from './views/NetworkSetter';
import Footer from './components/Footer';
import Response from './views/Response';
import UpdateKeyLoad from './views/UpdateKeyLoad';
import SubNavigation from './components/SubNavigation';

import ImportQr from './views/ImportQr';

import axios from 'axios';
import { setMaintainInfo } from './store/actions';
import { connect } from 'react-redux';

const checkMaintainInfo = async () => {
  return await axios.get(process.env.REACT_APP_MAINTAIN + "?" + Math.random());
}

class App extends React.Component {

  constructor(props) {
    super(props);

    this.runMaintain();
  }

  runMaintain() {
    var isOnMaintain;

    checkMaintainInfo()
      .then(
        res => {
          var start = new Date(res.data.start_time).valueOf();
          var end = new Date(res.data.end_time).valueOf();
          var curr = new Date().valueOf();
          isOnMaintain = (curr <= end && curr >= start) ? true : false;
          this.props.setMaintainInfo(res.data, isOnMaintain);
        }
      )
      .catch(
        err =>
          this.props.setMaintainInfo({
            start_time: null,
            end_time: null,
            message: {
              en: "",
              ko: ""
            }
          }, false)
      )

    setTimeout(() => this.runMaintain(), 500);
  }

  render() {

    return (
      <div className="app-container">
        <HashRouter >
          <Navigation history={this.props.history}/>
          <SubNavigation />
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/wallet/:account" component={Wallet} />
          <Route path="/key-generate" component={KeyGen} />
          <Route path="/get-address" component={AddressGen} />
          <Route path="/res-key-generate" component={ResKeyGen} />
          <Route path="/help" component={Help} />
          <Route path="/operation" component={Operation} />
          <Route path="/sign" component={Sign} />
          <Route path="/logout" component={Logout} />
          <Route path="/network" component={NetworkSetter} />
          <Route path="/response" component={Response} />
          <Route path='/loading' component={UpdateKeyLoad} />
          <Route path='/qr-reader' component={ImportQr} />
          <Footer />
        </HashRouter>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  maintain: state.maintain
});

const mapDispatchToProps = dispatch => ({
  setMaintainInfo: (info, onMaintain) => dispatch(setMaintainInfo(info, onMaintain))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);