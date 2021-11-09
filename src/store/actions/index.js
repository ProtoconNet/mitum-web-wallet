import Account from '../../lib/Account';
import History from '../../lib/History';
import { sha3_256 } from 'js-sha3';
import CryptoJS from 'crypto-js';

export const LOGIN = 'LOGIN';
export const SET_KEYPAIR = "SET_KEYPAIR";
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

export const SET_PRECISION = 'SET_PRECISION';
export const CLEAR_PRECISION = 'CLEAR_PRECISION';

export const SET_PAGE = 'SET_PAGE';
export const CLEAR_PAGE = 'CLEAR_PAGE';
 
export const SET_MAINTAIN_INFO = "SET_MAINTAIN_INFO";

export const SET_ACCOUNT_LIST = "SET_ACCOUNT_LIST";

export const SET_RESTORE_KEY = "SET_RESTORE_KEY";
export const CLEAR_RESTORE_KEY = "CLEAR_RESTORE_KEY";

export const ALLOW_LOGIN = "ALLOW_LOGIN";
export const REJECT_LOGIN="REJECT_LOGIN";

export function allowLogin() {
    return {
        type: ALLOW_LOGIN,
    }
}

export function rejectLogin() {
    return {
        type: REJECT_LOGIN,
    }
}

export function setPrecision(precision) {
    return {
        type: SET_PRECISION,
        precision,
    }
}

export function clearPrecision() {
    return {
        type: CLEAR_PRECISION,
    }
}
 
export function setRestoreKey(priv, reskey) {
    const encrypted  = CryptoJS.AES.encrypt(priv, reskey).toString();
    const verify =  sha3_256.create().update(encrypted + reskey).hex();
    return {
        type: SET_RESTORE_KEY,
        priv: encrypted,
        verify,
    }
}

export function clearRestoreKey() {
    return {
        type: CLEAR_RESTORE_KEY,
    }
}

export function setMaintainInfo(info, onMaintain) {
    return {
        type: SET_MAINTAIN_INFO,
        info,
        onMaintain,
    }
}

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

export function setAccountList(list, next) {
    return {
        type: SET_ACCOUNT_LIST,
        list,
        next,
    }
}

export function setKeypair(priv, pub) {
    return {
        type: SET_KEYPAIR,
        priv,
        pub,
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

