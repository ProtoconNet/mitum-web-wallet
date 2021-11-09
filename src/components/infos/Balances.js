import React from 'react';
import { balance } from './SubInfo';
import './Balances.scss';
import { connect } from 'react-redux';
import { parseDecimal, toPrecision } from '../../lib/Parse';

function Balances({ balances, title, labeled, precision }) {
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
                {balances ? balances.map(x => balance({
                    ...x,
                    amount: toPrecision(parseDecimal(x.amount), precision)
                })) : false}
            </ul>
        </section>
    );
}

const mapStateToProps = state => ({
    precision: state.network.precision,
})

export default connect(
    mapStateToProps,
    null
)(Balances);