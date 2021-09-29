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
export const CLEAR_QUEUE = 'CLEAR_QUEUE';

export const SET_NETWORK = 'SET_NETWORK';
export const CLEAR_NETWORK = 'CLEAR_NETWORK';
export const SET_NETWORK_ID = 'SET_NETWORK_ID';
export const CLEAR_NETWORK_ID = 'CLEAR_NETWORK_ID';

export const SET_PAGE = 'SET_PAGE';
export const CLEAR_PAGE = 'CLEAR_PAGE';
 
export function setPage() {
    return {
        type: SET_PAGE,
    };
}

export function clearPage() {
    return {
        type: CLEAR_PAGE
    }
}

export function login(address, privateKey, publicKey, data) {
    const account = new Account(address, privateKey, publicKey, data);
    return {
        type: LOGIN,
        account: {
            address: account.address,
            accountType: account.accountType,
            publicKey: account.publicKey,
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

export function enqueueOperation(item) {
    return {
        type: ENQUEUE_OPERATION,
        item,
    }
}

export function dequeueOperation() {
    return {
        type: DEQUEUE_OPERATION
    }
}

export function clearQueue() {
    return {
        type: CLEAR_QUEUE
    }
}

export function setNetworkId(id) {
    return {
        type: SET_NETWORK_ID,
        id,
    }
}

export function setNetwork(network) {
    return {
        type: SET_NETWORK,
        network,
    }
}

export function clearNetworkId() {
    return {
        type: CLEAR_NETWORK_ID,
    }
}

export function clearNetwork() {
    return {
        type: CLEAR_NETWORK
    }
}

