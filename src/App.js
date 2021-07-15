import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import './App.scss';

import Home from './views/Home';
import Login from './views/Login';
import Wallet from './views/Wallet';
import KeyGen from './views/KeyGen';
import ResKeyGen from './views/ResKeyGen';
import Help from './views/Help';
import Operation from './views/Operation';
import Sign from './views/Sign';

import Navigation from './components/Navigation';
import Logout from './views/Logout';

class App extends React.Component {
  render() {

    return (
      <div className="app-container">
        <HashRouter className="app-container">
          <Navigation />
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/wallet/:account" component={Wallet} />
          <Route path="/key-generate" component={KeyGen} />
          <Route path="/res-key-generate" component={ResKeyGen} />
          <Route path="/help" component={Help} />
          <Route path="/operation" component={Operation} />
          <Route path="/sign" component={Sign} />
          <Route path="/logout" component={Logout} />
        </HashRouter>
      </div>
    );
  }
}

export default App;
