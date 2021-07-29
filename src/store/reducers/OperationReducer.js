import * as actions from '../actions';
import * as mode from '../../text/mode'; 
import download from '../../lib/Url';

const initialState = {
    operation: mode.OPER_DEFAULT,
    json: {},
    data: [],
    download: undefined,
    filename: "",
    isBroadcast: false,
    isStateIn: false,
    res: undefined,
    status: 400
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_OPERATION:
            if(action.operation === mode.OPER_DEFAULT){
                return initialState;
            }
            return {
                ...state,
                operation: action.operation,
                json: action.json,
                download: download(action.json),
                filename: action.json.hash
            }
        case actions.SET_RESPONSE:
            return {
                ...state,
                isBroadcast: action.isBroadcast,
                isStateIn: action.isStateIn,
                res: action.res,
                status: action.status,
                data: action.data,
            }
        default:
            return state;
    }
}