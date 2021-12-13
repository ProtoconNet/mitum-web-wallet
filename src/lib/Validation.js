import { TYPE_CREATE_ACCOUNT, TYPE_UPDATE_KEY, TYPE_TRANSFER } from '../text/mode';

export const isOperation = (json) => {

    if (!json) { return false; }

    if (!Object.prototype.hasOwnProperty.call(json, '_hint') || !json._hint) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(json, 'hash') || !json.hash) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(json, 'memo')) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(json, 'fact') || !json.fact) {
        return false;
    }

    if (!Object.prototype.hasOwnProperty.call(json, 'fact_signs')) {
        return false;
    }

    // const signatures = json.fact_signs.map(x => x.signatures);
    // if (signatures.length < 1) {
    //     return false;
    // }

    return true;
}

export const isInLimit = (target, limit) => {
    return target.length <= limit;
}

export const isItemsInLimit = (operation) => {
    if (!isOperation(operation)) {
        return false;
    }

    switch (operation._hint) {
        case TYPE_CREATE_ACCOUNT:
        case TYPE_TRANSFER:
            if (!Object.prototype.hasOwnProperty.call(operation.fact, 'items')) {
                return false;
            }
            var operationValid = true;
            var operationItems = operation.fact.items.map(x => {
                if (Object.prototype.hasOwnProperty.call(x, "keys") && !isInLimit(x.keys.keys, parseInt(process.env.REACT_APP_LIMIT_KEYS_IN_KEYS))) {
                    operationValid = false;
                }
                if (Object.prototype.hasOwnProperty.call(x, "amounts") && !isInLimit(x.amounts, parseInt(process.env.REACT_APP_LIMIT_AMOUNTS_IN_ITEM))) {
                    operationValid = false;
                }
                return x;
            });

            if (!isInLimit(operationItems, parseInt(process.env.REACT_APP_LIMIT_ITEMS_IN_OPERATION))) {
                operationValid = false;
            }
            return operationValid;
        case TYPE_UPDATE_KEY:
            return Object.prototype.hasOwnProperty.call(operation.fact, "keys") && isInLimit(operation.fact.keys, parseInt(process.env.REACT_APP_LIMIT_KEYS_IN_KEYS));
        default:
            return false;
    }
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

export const isPrivateKeyValidWithNotType = (pk) => {

    if (typeof (pk) !== typeof ("string")) {
        return false;
    }

    if (!/^[a-zA-Z0-9]+(?![^a-zA-Z0-9])\b/.test(pk.trim())) {
        return false;
    }

    return true;
}

export const isPrivateKeyValid = (pvk) => {

    if (typeof (pvk) !== typeof ("string")) {
        return false;
    }

    const pk = pvk.trim();

    if(pk.length < 55) {
        return false;
    }

    const key = pk.substring(0, 52);
    const type = pk.substring(52);

    if (!/^[a-zA-Z0-9]+(?![^a-zA-Z0-9])\b/.test(key)) {
        return false;
    }

    if(type === 'mpr') {
        return true;
    }
    else {
        return false;
    }
}

export const isPublicKeyValid = (pbk) => {

    if (typeof (pbk) !== typeof ('string')) {
        return false;
    }

    const pubk = pbk.trim();

    const idx = pubk.indexOf('mpu');
    if(idx < 0) {
        return false;
    }

    const key = pubk.substring(0, idx);
    const type = pubk.substring(idx);

    if (!/[a-zA-Z0-9]+/.test(key)) {
        return false;
    }

    if(type !== 'mpu') {
        return false;
    }
    else {
        return true;
    }
}

export const isAddressValid = (adr) => {

    if (typeof (adr) !== typeof ("string")) {
        return false;
    }

    const addr = adr.trim();

    const idx = adr.indexOf('mca');
    if(idx < 0) {
        return false;
    }

    const type = addr.substring(idx);
    const address = addr.substring(0, idx);

    if (!/[a-zA-Z0-9]+/.test(address)) {
        return false;
    }

    if (type !== 'mca') {
        return false;
    }

    return true;
}

export const isRestoreKeyValid = (res) => {
    if (!/^[a-zA-Z0-9@!#^&*+]+(?![^a-zA-Z0-9@!#^&*+])\b/.test(res)) {
        return false;
    }

    if (res.length < 8 || res.length > 16) {
        return false;
    }

    return true;
}

export const isNum = (numb) => {
    if (!numb) {
        return false;
    }

    const num = numb.trim();

    if (/[^0-9]/.test(num)) {
        return false;
    }

    if (!/[1-9][0-9]*/.test(num)) {
        return false;
    }

    if (num.indexOf('.') > -1) {
        return false;
    }

    return true;
}

export const isThresholdValid = (threshold) => {
    const thres = threshold.trim();

    if (!isNum(thres)) {
        return false;
    }

    if (!/[1-9][0-9]{0,2}/.test(thres)) {
        return false;
    }

    const thresNum = parseInt(thres);
    if (thresNum < 1 || thresNum > 100) {
        return false;
    }

    return true;
}

export const isWeightValid = (weight) => {
    return isNum(("" + weight).trim());
}

export const isWeightsValidToThres = (weights, thres) => {

    if (!isThresholdValid(thres)) {
        return false;
    }

    let total = 0;
    for (let i = 0; i < weights.length; i++) {
        if (!isWeightValid(weights[i])) {
            return false;
        }
        total += parseInt(weights[i]);
    }

    if (total < parseInt(thres)) {
        return false;
    }

    return true;
}

export const isCurrencyValid = (currency, currencies) => {

    if (!currency || !currencies || currencies.length < 1) {
        return false;
    }

    if (typeof (currency) !== typeof ('string')) {
        return false;
    }

    if (!/[A-Z]{3,3}/.test(currency.trim())) {
        return false;
    }

    return isDuplicate(currency.trim(), currencies);
}

export const isFloat = (num) => {
    if (isNum(num.trim())) {
        return true;
    }

    const idx = num.indexOf('.');
    if (idx < 0) {
        return false;
    }

    const integer = num.substring(0, idx);
    const remain = num.substring(idx + 1);
    if ((isNum(integer) || isZero(integer)) && (isNum(remain) || isZero(remain))) {
        return true;
    }

    return false;
}

export const isAmountValid = (amount) => {
    if (isNum(amount.trim())) {
        return true;
    }

    if (isFloat(amount.trim())) {
        return true;
    }

    return false;
}

export const isZero = (num) => {
    for (var i = 0; i < num.length; i++) {
        if (num.charAt(i) !== '0') {
            return false;
        }
    }

    return true;
}

export const isDuplicate = (target, list) => {

    if (!target || !list) {
        return false;
    }

    for (let i = 0; i < list.length; i++) {
        if (target.trim() === list[i]) {
            return true;
        }
    }

    return false;
}