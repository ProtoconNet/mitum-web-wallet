import React from 'react';
import { Redirect } from 'react-router';
import NewKeyGenerator from '../components/NewKeyGenerator';
import SeedKeyGenerator from '../components/SeedKeyGenerator';
import './KeyGen.scss';

function KeyGen({ location }) {

    return (
        <div className="key-generator-container">
            {location.pathname === "/key-gen/new" ? <NewKeyGenerator />
                : location.pathname === "/key-gen/seed" ? <SeedKeyGenerator />
                    : <Redirect to="login" />}
        </div>
    )
}

export default KeyGen;