import React from 'react';
import SmallButton from '../buttons/SmallButton';
import InputBox from '../InputBox';
import './AmountAdder.scss';

function AmountAdder(props) {

    const { onCurrencyChange, onAmountChange, currency, amount, isAddDisabled, onAdd } = props;

    return (
        <section className='amount-adder-container'>
            <div className="amount-adder">
                <InputBox
                    size="small" useCopy={false} disabled={false} placeholder="currency"
                    onChange={onCurrencyChange}
                    value={currency} />
                <InputBox
                    size="medium" useCopy={false} disabled={false} placeholder="amount"
                    value={amount}
                    onChange={onAmountChange} />
                <SmallButton
                    visible={true}
                    disabled={isAddDisabled}
                    onClick={onAdd}>ADD</SmallButton>
            </div>
        </section>
    );
}

export default AmountAdder;