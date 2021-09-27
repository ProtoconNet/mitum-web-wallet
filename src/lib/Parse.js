import { OPER_CREATE_ACCOUNT, OPER_DEFAULT, OPER_TRANSFER, OPER_UPDATE_KEY, TYPE_CREATE_ACCOUNT, TYPE_TRANSFER, TYPE_UPDATE_KEY } from "../text/mode";

const getOperationFromType = (type) => {
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

export default getOperationFromType;