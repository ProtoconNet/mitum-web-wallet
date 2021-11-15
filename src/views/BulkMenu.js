import React, { Component } from 'react';
import CreateOperations from '../components/bulks/CreateOperations';
import SignOperations from '../components/bulks/SignOperations';
import './BulkMenu.scss';

class BulkMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showMenu: true,
            showCreate: false,
            showSign: false,
        }
    }

    render() {
        const { showMenu, showCreate, showSign } = this.state;
        return (
            <div className="bulk-menu-container">
                {
                    showMenu
                        ? (
                            <section id="menu">
                                <p onClick={() => this.setState({ showMenu: false, showCreate: true, showSign: false })}>CREATE MUTIPLE OPERATIONS</p>
                                <p onClick={() => this.setState({ showMenu: false, showCreate: false, showSign: true })}>SIGN MULTIPLE OPERATIONS</p>
                            </section>
                        )
                        : false
                }
                {showCreate ? <CreateOperations /> : false}
                {showSign ? <SignOperations /> : false}
            </div>
        );
    }
}

export default BulkMenu;