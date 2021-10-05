import { key as keyHint } from '../text/hint.json';
import { address as addressHint } from '../text/hint.json';

export const isOperation = (json) => {

    if (!json) { return false; }

    if(!Object.prototype.hasOwnProperty.call(json, '_hint') || !json._hint) {
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

export const isPrivateKeyValidWithNotHint = (pk) => {

    if (typeof (pk) !== typeof ("string")) {
        return false;
    }

    if(!/^[a-zA-Z0-9]+(?![^a-zA-Z0-9])\b/.test(pk)) {
        return false;
    }

    return true;
}

export const isPrivateKeyValid = (pk) => {

    if (typeof (pk) !== typeof ("string")) {
        return false;
    }

    const idx = pk.indexOf(':');
    if (idx < 0) {
        return false;
    }
    const key = pk.substring(0, idx);
    const hint = pk.substring(idx + 1);

    if(!/^[a-zA-Z0-9]+(?![^a-zA-Z0-9])\b/.test(key)) {
        return false;
    }

    switch (hint) {
        case `${keyHint.btc.priv}-${process.env.REACT_APP_VERSION}`:
        case `${keyHint.ether.priv}-${process.env.REACT_APP_VERSION}`:
        case `${keyHint.stellar.priv}-${process.env.REACT_APP_VERSION}`:
            return true;
        default:
            return false;
    }
}

export const isPublicKeyValid = (pubk) => {

    if (typeof (pubk) !== typeof ('string')) {
        return false;
    }

    const idx = pubk.indexOf(':');
    if (idx < 0) {
        return false;
    }

    const key = pubk.substring(0, idx);
    const hint = pubk.substring(idx + 1);
    
    if(!/[a-zA-Z0-9]+/.test(key)) {
        return false;
    }

    switch (hint) {
        case `${keyHint.btc.pub}-${process.env.REACT_APP_VERSION}`:
        case `${keyHint.ether.pub}-${process.env.REACT_APP_VERSION}`:
        case `${keyHint.stellar.pub}-${process.env.REACT_APP_VERSION}`:
            return true;
        default:
            return false;
    }
}

export const isAddressValid = (addr) => {

    if (typeof (addr) !== typeof ("string")) {
        return false;
    }

    const idx = addr.indexOf(':');
    if (idx < 0) {
        return false;
    }

    const hint = addr.substring(idx + 1);
    const address = addr.substring(1, idx);
    if (hint !== `${addressHint}-${process.env.REACT_APP_VERSION}`) {
        return false;
    }

    if(!/[a-zA-Z0-9]+/.test(address)) {
        return false;
    }

    return true;
}

const isNum = (num) => {
    if (!num) {
        return false;
    }

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

export const isThresholdValid = (thres) => {
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
    return isNum(weight);
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

    if(!currency || !currencies || currencies.length < 1) {
        return false;
    }

    if(typeof (currency) !== typeof ('string')) {
        return false;
    }

    if(!/[A-Z]{3,3}/.test(currency)) {
        return false;
    }

    return isDuplicate(currency, currencies);
}

export const isAmountValid = (amount) => {
    return isNum(amount);
}

export const isDuplicate = (target, list) => {

    if(!target || !list) {
        return false;
    }

    for(let i = 0; i < list.length; i++) {
        if(target.indexOf(list[i]) !== -1) {
            return true;
        }
    }

    return false;
}