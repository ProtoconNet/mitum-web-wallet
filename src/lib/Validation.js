export const isOperation = (json) => {

    if (!json) { return false; }

    if (!Object.prototype.hasOwnProperty.call(json, 'hash') || !json.hash) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(json, 'memo')) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(json, 'fact') || !json.fact) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(json, 'fact_signs') || !json.fact_signs) {
        return false;
    }

    const signatures = json.fact_signs.map(x => x.signatures);
    if (signatures.length < 1) {
        return false;
    }

    return true;
}

export const isStateValid = (state) => {

    if (!state) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(state, 'location') || !state.location) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(state.location, 'state') || !state.location.state) {
        return false;
    }

    return true;
}

export const isResponseValid = (state) => {

    if (!state) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(state, 'res') || !state.res) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(state, 'status') || !state.status) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(state, 'operation') || !state.operation) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(state, 'data')) {
        return false;
    }

    return true;
}

export const isAccountValid = (account) => {

    if (!account) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(account, 'address') || !account.address) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(account, 'accountType') || !account.accountType) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(account, 'publicKeys') || !account.publicKeys) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(account, 'balances') || !account.balances) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(account, 'privateKey') || !account.privateKey) {
        return false;
    }

    // if (!Object.prototype.hasOwnProperty.call(account, 'restoreKey') || !account.restoreKey) {
    //     return false;
    // }

    return true;
}