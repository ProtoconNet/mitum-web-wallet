import React from 'react';
import { key } from './SubInfo';
import './Keys.scss';

function Keys({ keys, title }) {
    return (
        <section className='key-container'>
            <p id='head'>{title}</p>
            <div className='label'>
                <p id='key'>KEY</p>
                <p id='weight'>WEIGHT</p>
            </div>
            <ul>
                {keys ? keys.map(x => key(x)) : false}
            </ul>
        </section>
    );
}

export default Keys;