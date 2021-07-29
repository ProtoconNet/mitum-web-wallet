import React from 'react';
import InputBox from '../InputBox';
import './ExtraAdder.scss';

function ExtraAdder({ thres, currency, onCurrencyChange, onThresChange }) {

    return (
        <section className='extra-adder-container'>
            <div className="thres-adder">
                <p>THRESHOLD :</p>
                <InputBox
                    size="small" useCopy={false} disabled={false} placeholder='threshold'
                    value={thres}
                    onChange={onThresChange} />
            </div>
            <div className="currency-adder">
                <p>CURRENCY ID:</p>
                <InputBox
                    size="small" useCopy={false} disabled={false} placeholder='currency'
                    value={currency}
                    onChange={onCurrencyChange} />
            </div>
        </section>
    );
}

export default ExtraAdder;