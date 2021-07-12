import React from 'react';
import { Redirect } from 'react-router';
import copy from 'copy-to-clipboard';
import './NewOperation.scss';
import ConfirmButton from './buttons/ConfirmButton';

const onCopy = (msg) => {
    copy(msg);
    alert('copied!');
}

class NewOperation extends React.Component {
    state = {
        isRedirect: false
    }

    onClick() {
        this.setState({ isRedirect: true });
    }
    
    renderRedirect() {
        return (this.state.isRedirect ? 
            <Redirect to={{
                    pathname: '/sign',
                    state: {
                        account: this.props.data.account,
                            privateKey: this.props.data.privateKey,
                            json: this.props.data.json
                    }}}/> : false 
        );
    }

    render() {
        return (
            <div className="json-container">
                <pre style={{
                    display: 'block',
                    padding: '10px 30px',
                    margin: '0',
                    overflow: 'visible',}}
                    onClick={() => onCopy(JSON.stringify(this.props.data.json, null, 4))}>
                    { JSON.stringify(this.props.data.json, null, 4) }
                </pre>
                <div className="json-confirm">
                    <ConfirmButton onClick={() => this.onClick()}>ACCEPT</ConfirmButton>
                </div>
                { this.renderRedirect() }            
            </div>
        );
    }
}
export default NewOperation;