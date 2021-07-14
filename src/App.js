import React from 'react';
import { HashRouter, Route, Link } from 'react-router-dom';
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

class App extends React.Component {
  render() {

    return (
      <div>
        <HashRouter className="app-container">
          <Link className='link-help' to="/help">HELP</Link>
          <Navigation />
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/wallet/:account" component={Wallet} />
          <Route path="/key-generate" component={KeyGen} />
          <Route path="/res-key-generate" component={ResKeyGen} />
          <Route path="/help" component={Help} />
          <Route path="/operation" component={Operation} />
          <Route path="/sign" component={Sign} />
        </HashRouter>
      </div>
    );
  }
}

export default App;
