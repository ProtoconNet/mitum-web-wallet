import React, { Component } from 'react';
import { balance } from './SubInfo';
import './Balances.scss';
import { connect } from 'react-redux';
import { parseAmountToDecimal } from '../../lib/Parse';

class Balances extends Component {

    render() {
        const { balances, title, labeled, decimalPoint } = this.props;

        return (
            <section className='balance-container'>
                <p id='head'>{title}</p>
                {labeled ? (
                    <div className='label'>
                        <p id='currency'>CURRENCY ID</p>
                        <p id='amount'>AMOUNT</p>
                    </div>
                ) : false}
                <ul className={labeled ? 'wide' : 'slim'}>
                    {balances ? balances.map(x => balance({ currency: x.currency, amount: parseAmountToDecimal(x.amount, decimalPoint)})) : false}
                </ul>
            </section>
        );
    }
}

const mapStateToProps = state => ({
    decimalPoint: state.network.decimal,
});

export default connect(
    mapStateToProps,
    null
)(Balances);