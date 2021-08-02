import Account from '../../lib/Account';
import History from '../../lib/History';

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const SET_HISTORY = 'SET_HISTORY';
export const CLEAR_HISTORY = 'CLEAR_HISTORY';

export const SET_OPERATION = 'SET_OPERATION';
export const SET_RESPONSE = 'SET_RESPONSE';

export const ENQUEUE_OPERATION = 'ENQUEUE_OPERATION';
export const DEQUEUE_OPERATION = 'DEQUEUE_OPERATION';

export function login(address, privateKey, data) {
    const account = new Account(address, privateKey, data);
    return {
        type: LOGIN,
        account: {
            address: account.address,
            accountType: account.accountType,
            publicKeys: account.publicKeys,
            balances: account.balances,
            privateKey: account.privateKey,
            restoreKey: undefined,
        }
    }
}

export function logout() {
    return {
        type: LOGOUT
    }
}

export function setHistory(data, me) {
    if(!data) {
        return {
            type: SET_HISTORY,
            history: [],
        }
    }

    const histories = data._embedded.map(x => new History(x._embedded, me));
    const splitHistories = [];

    for(let i = 0; i < histories.length; i++){
        const _i = histories[i];
        if(!_i.items){
            continue;
        }
        for(let j = 0; j < _i.items.length; j++){
            const _j = _i.items[j];
            for(let z = 0; z < _j.amounts.length; z++) {
                const _z = _j.amounts[z];
                splitHistories.push({
                    hash: _i.factHash,
                    confirmation: _i.inState ? 'SUCCESS' : 'FAIL',
                    direction: me === _i.sender ? 'SEND' : 'RECEIVE',
                    confirmedAt: _i.confirmedAt,
                    target: me === _i.sender ? _j.receiver : _i.sender,
                    currency: _z.currency,
                    amount: _z.amount
                })
            }
        }
    }

    return {
        type: SET_HISTORY,
        history: splitHistories,
    }
}

export function clearHistory() {
    return {
        type: CLEAR_HISTORY
    }
}

export function setOperation(operation, json) {
    return {
        type: SET_OPERATION,
        operation,
        json,
    }
}

export function setResponse(isBroadcast, isStateIn, res, status, data) {
    return {
        type: SET_RESPONSE,
        isBroadcast,
        isStateIn,
        res,
        status,
        data,
    }
}

export function enqueueOperation(hash) {
    return {
        type: ENQUEUE_OPERATION,
        hash,
    }
}

export function dequeueOperation() {
    return {
        type: DEQUEUE_OPERATION
    }
}