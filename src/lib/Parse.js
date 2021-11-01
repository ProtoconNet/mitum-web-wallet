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

    if (len >= (decimal + 1)) {
        const integer = tmp.substring(0, len - decimal);
        const remain = tmp.substring(len - decimal, len);

        return integer + '.' + remain;
    }
    else {
        if(decimal !== len) {
            return "0." + "0" * (decimal - len) + tmp;
        }
        else {
            return "0." + tmp;
        }
    }
}

export function parseDecimalToAmount(x, decimal) {
    const idx = x.indexOf('.');

    if (idx < 0) {
        return parseInt(x) * parseInt(Math.pow(10, decimal));
    }

    const integer = x.substring(0, idx);
    let remain = x.substring(idx + 1, x.length);
    if(remain.length !== decimal) {
        remain = remain + '0' * (decimal - remain.length);
    }

    if(integer === "0") {
        return parseInt(remain);
    }
    else {
        return parseInt(integer + remain);
    }
}