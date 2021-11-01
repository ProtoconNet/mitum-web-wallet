import { OPER_CREATE_ACCOUNT, OPER_DEFAULT, OPER_TRANSFER, OPER_UPDATE_KEY, TYPE_CREATE_ACCOUNT, TYPE_TRANSFER, TYPE_UPDATE_KEY } from "../text/mode";

export function getOperationFromType(type) {
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

export function parseAmountToDecimal(x, decimal) {
    const tmp = "" + x;
    const len = tmp.length;
    decimal = parseInt(decimal);

    if (len >= (decimal + 1)) {
        const integer = tmp.substring(0, len - decimal);
        const remain = tmp.substring(len - decimal, len)
        return integer + '.' + remain;
    }
    else {
        let result = "0.";
        if(decimal !== len) {
            for(var i = 0 ; i < decimal - len; i++) {
                result += "0"
            }
            return result + tmp;
        }
        else {
            return "0." + tmp;
        }
    }
}

export function parseDecimalToAmount(x, decimal) {
    decimal = parseInt(decimal);
    const target = "" + x;
    const idx = target.indexOf('.');

    if (idx < 0) {
        return parseInt(target) * parseInt(Math.pow(10, decimal));
    }

    const integer = target.substring(0, idx);
    let remain = target.substring(idx + 1, target.length);

    if(remain.length !== decimal) {
        const len = decimal - remain.length;
        for(let i = 0; i < len; i++) {
            remain += '0';
        }
    }

    if(integer === "0") {
        return parseInt(remain);
    }
    else {
        return parseInt(integer + remain);
    }
}

export function cutDecimal(x, decimal) {
    const idx = x.indexOf('.');
    let result = x.substring(0, idx + decimal + 2);
    result = (parseFloat(result) * 1000 / 1000);

    if(result === 0.000) {
        return "0.000";
    }

    return result;
}