import Account from '../../lib/Account';

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export const SET_OPERATION = 'SET_OPERATION';
export const SET_RESPONSE = 'SET_RESPONSE';

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
            restoreKey: undefined
        }
    }
}

export function logout() {
    return {
        type: LOGOUT
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