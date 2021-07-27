import React from 'react';
import axios from 'axios';
import "./OperationConfirm.scss";
import { Redirect } from 'react-router-dom';

const broadcast = async (operation) => {
    if (!operation || !Object.prototype.hasOwnProperty.call(operation, 'hash') || !Object.prototype.hasOwnProperty.call(operation, 'memo')
        || !Object.prototype.hasOwnProperty.call(operation, 'fact') || !Object.prototype.hasOwnProperty.call(operation, 'fact_signs')
        || !operation.hash || !operation.fact || !operation.fact_signs) {
        return undefined;
    }

    return await axios.post(process.env.REACT_APP_API_BROADCAST, operation);
}

class OperationConfirm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRedirect: false,
            status: undefined,
            response: undefined
        }
    }

    onSend(json) {
        broadcast(json).then(
            res => {
                this.setState({
                    isRedirect: true,
                    status: res.request.status,
                    response: res.data
                });
            }
        ).catch(
            e => {
                this.setState({
                    isRedirect: true,
                    status: e.response.data.status,
                    response: e.response.data
                })
                alert('Could not send operation');
            }
        );
    }

    render() {
        const { isOpen, onClose, title, json, filename, download } = this.props;
        return (
            <div className={isOpen ? 'openModal modal' : 'modal'}>
                {this.state.isRedirect
                    ? <Redirect to={{
                        pathname: '/response',
                        state: {
                            res: this.state.response,
                            status: this.state.status,
                            operation: this.props.operation
                        }
                    }} />
                    : false}
                {isOpen ? (
                    <section>
                        <header>
                            {title}
                            <button className="close" onClick={onClose}> &times; </button>
                        </header>
                        <main>
                            <p>You can't rollback the request after the confirmation.</p>
                            <span>
                                <p className="modal-button" id="no" onClick={onClose}>{"no! :("}</p>
                                <a className="modal-button" id="no" target="_blank" download={`${filename}.json`}
                                    href={download} rel="noreferrer">
                                    {"no! Just download the json file. :["}
                                </a>
                                <p className="modal-button" id="yes" onClick={() => this.onSend(json)}>{"yes! :)"}</p>
                            </span>
                        </main>
                    </section>
                ) : null}
            </div>
        )
    }
}

export default OperationConfirm;