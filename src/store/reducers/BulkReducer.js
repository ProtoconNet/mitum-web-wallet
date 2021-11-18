import { Generator } from 'mitumc';
import * as actions from '../actions';

export const ca = "ca";
export const tf = "tf";

const initialState = {
    csv: [],
    json: [],
}

function createAccount(_parsed, id) {
    const generator = new Generator(id);
    const key = generator.formatKey(_parsed.key, parseInt(_parsed.weight));
    const keys = generator.createKeys([key], parseInt(_parsed.threshold));

    const amounts = [];
    _parsed.amounts.forEach(
        x => {
            amounts.push(generator.formatAmount(x.amount, x.currency));  
        }
    );

    return generator.createCreateAccountsItem(keys, generator.createAmounts(amounts));
}

function transfer(_parsed, id) {
    const generator = new Generator(id);

    const amounts = [];
    _parsed.amounts.forEach(
        x => {
            amounts.push(generator.formatAmount(x.amount, x.currency));
        }
    );

    return generator.createTransfersItem(_parsed.receiver, generator.createAmounts(amounts));
}

function toOperation(parsed, id, address, priv) {
    const json = [];

    const caItems = [];
    const tfItems = [];

    parsed.forEach(
        (x, idx) => {
            switch (x.type) {
                case ca:
                    caItems.push({ idx, item: createAccount(x, id) });
                    break;
                case tf:
                    tfItems.push({ idx, item: transfer(x, id) });
                    break;
                default:
                    throw new Error("[ERROR] Invalid operation in the parsed csv");
            }
        }
    );

    var i, target, fact, oper;
    const generator = new Generator(id);
    for (i = 0; i < parseInt(caItems.length / 10); i++) {
        target = caItems.slice(i * 10, (i + 1) * 10)
        fact = generator.createCreateAccountsFact(address, target.map(x => x.item));
        oper = generator.createOperation(fact, "");
        oper.addSign(priv);
        json.push({
            idxs: target.map(x => x.idx),
            operation: oper.dict(),
        });
    }
    for (i = 0; i < parseInt(tfItems.length / 10); i++) {
        target = tfItems.slice(i * 10, (i + 1) * 10)
        fact = generator.createTransfersFact(address, target.map(x => x.item));
        oper = generator.createOperation(fact, "");
        oper.addSign(priv);
        json.push({
            idxs: target.map(x => x.idx),
            operation: oper.dict(),
        });
    }

    if (caItems.length % 10) {
        target = caItems.slice(caItems.length - (caItems.length % 10), caItems.length);
        fact = generator.createCreateAccountsFact(address, target.map(x => x.item));
        oper = generator.createOperation(fact, "");
        oper.addSign(priv);
        json.push({
            idxs: target.map(x => x.idx),
            operation: oper.dict(),
        });
    }

    if (tfItems.length % 10) {
        target = tfItems.slice(tfItems.length - (tfItems.length % 10), tfItems.length);
        fact = generator.createTransfersFact(address, target.map(x => x.item));
        oper = generator.createOperation(fact, "");
        oper.addSign(priv);
        json.push({
            idxs: target.map(x => x.idx),
            operation: oper.dict(),
        });
    }

    return json;
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_CSVS:
            return {
                ...state,
                csv: action.csvs,
            }
        case actions.CSV_TO_OPERATION:
            return {
                ...state,
                json: toOperation(action.parsed, action.id, action.address, action.priv),
            }
        case actions.CLEAR_CSVS:
            return initialState;
        default:
            return state;
    }
}