import React from 'react';
import { balance } from './SubInfo';
import './Balances.scss';

function Balances({ balances, title, labeled }) {
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
                {balances ? balances.map(x => balance(x)) : false}
            </ul>
        </section>
    );
}

export default Balances;