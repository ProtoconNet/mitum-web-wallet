export const balance = x => {
    return (
        <li key={x.currency}>
            <p id='currency'>{x.currency}</p>
            <p id='amount'>{x.amount}</p>
        </li>
    );
}

export const key = x => {
    return (
        <li key={x.key}>
            <p id='key'>{x.key}</p>
            <p id='weight'>{x.weight}</p>
        </li>
    );
}