import { OPER_CREATE_ACCOUNT, OPER_DEFAULT, OPER_TRANSFER, OPER_UPDATE_KEY, TYPE_CREATE_ACCOUNT, TYPE_TRANSFER, TYPE_UPDATE_KEY } from "../text/mode";
import { isNum, isZero } from './Validation';

export const getOperationFromType = (type) => {
    switch (type) {
        case TYPE_CREATE_ACCOUNT:
            return OPER_CREATE_ACCOUNT;
        case TYPE_UPDATE_KEY:
            return OPER_UPDATE_KEY;
        case TYPE_TRANSFER:
            return OPER_TRANSFER;
        default:
            return OPER_DEFAULT;
    }
}

export const parseDecimal = (amount) => {
    const expDecimal = process.env.REACT_APP_DECIMAL;

    if (typeof amount !== "string") {
        throw new Error("Invalid type for parseDecimal! current type: " + typeof amount);
    }

    amount = amount.trim();

    if (!isNum(amount)) {
        throw new Error("Invalid input for parseDecimal! current amount: " + amount);
    }

    if (amount.length > expDecimal) {
        const integer = amount.substring(0, amount.length - expDecimal);
        const remain = amount.substring(amount.length - expDecimal);

        return integer + '.' + remain;
    }
    else if (amount.length === expDecimal) {
        return '0.' + amount;
    }
    else {
        const len = expDecimal - amount.length;
        for (var i = 0; i < len; i++) {
            amount = '0' + amount;
        }
        return '0.' + amount;
    }
}

export const toPrecision = (decimal, precision) => {
    const idx = decimal.indexOf('.');
    if (idx < 0) {
        return decimal;
    }

    const integer = decimal.substring(0, idx);
    const remain = decimal.substring(idx + 1);

    if (remain.length <= precision) {
        return decimal;
    }

    return integer + '.' + remain.substring(0, precision);
}

export const parseAmount = (decimal) => {
    const expDecimal = process.env.REACT_APP_DECIMAL;
    const idx = decimal.indexOf('.');
    var i;

    if (idx < 0) {
        for (i = 0; i < expDecimal; i++) {
            decimal += '0';
        }
        return decimal;
    }

    const integer = decimal.substring(0, idx);
    let remain = decimal.substring(idx + 1);

    if (remain.length > expDecimal) {
        throw new Error("Invalid float precision for parseAmount! You cannot use float for amount with precision > " + expDecimal);
    }

    const len = expDecimal - remain.length;
    for (i = 0; i < len; i++) {
        remain += '0';
    }

    if (isZero(integer)) {
        var zeroPos = -1;
        for (var j = 0; j < remain.length; j++) {
            if (remain.charAt(j) !== '0') {
                zeroPos = j;
                break;
            }
        }

        if(zeroPos < 0){
             return remain;
        }
        return remain.substring(zeroPos);
    }
    return integer + remain;
}