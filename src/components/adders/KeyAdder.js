import React from 'react';
import SmallButton from '../buttons/SmallButton';
import InputBox from '../InputBox';
import './KeyAdder.scss';

function KeyAdder(props) {

    const { onKeyChange, onWeightChange, onAdd, isAddDisabled, pub, weight, useThres } = props;

    return (
        <section className='key-adder-container'>
            <div className="key-adder">
                <InputBox size="medium" useCopy={false} disabled={false} placeholder="public key"
                    value={pub}
                    onChange={onKeyChange} />
                <InputBox size="small" useCopy={false} disabled={false} placeholder="weight"
                    value={weight}
                    onChange={onWeightChange} />
                <SmallButton
                    visible={true}
                    disabled={isAddDisabled}
                    onClick={onAdd}>ADD</SmallButton>
            </div>
            {useThres
                ? (
                    <div className="thres-adder">
                        <p>THRESHOLD:</p>
                        <InputBox
                            size="small" useCopy={false} disabled={false} placeholder='threshold'
                            value={props.thres}
                            onChange={props.onThresChange} />
                    </div>
                )
                : false
            }
        </section>
    );
}

export default KeyAdder;