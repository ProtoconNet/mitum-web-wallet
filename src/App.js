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

class App extends React.Component {
  render() {

    return (
      <div className="app-container">
        <HashRouter >
          <Navigation />
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
          <Footer />
        </HashRouter>
      </div>
    );
  }
}

export default App;
