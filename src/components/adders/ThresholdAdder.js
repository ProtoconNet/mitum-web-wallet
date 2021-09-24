import React from 'react';
import InputBox from '../InputBox';
import './ThresholdAdder.scss';

function ThresholdAdder({ thres, onThresChange }) {

    return (
        <section className='threshold-adder-container'>
            <div className="threshold-adder">
                <p>THRESHOLD :</p>
                <InputBox
                    size="small" useCopy={false} disabled={false} placeholder='threshold'
                    value={thres}
                    onChange={onThresChange} />
            </div>
        </section>
    );
}

export default ThresholdAdder;