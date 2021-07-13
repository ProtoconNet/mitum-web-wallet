import Account from '../../lib/Account';

export const LOGIN = 'LOGIN';

export function login(address, privateKey, data) {
    const account = new Account(address, privateKey, data);
    return {
        type: LOGIN,
        account: {
            address: account.address,
            accountType: account.accountType,
            publicKeys: account.publicKeys,
            balances: account.balances,
            privateKey: account.privateKey
        }
    }
}