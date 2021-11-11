import * as actions from '../actions';

const createAccountText = "create-accounts";
const transfersText = "transfers";

const createAccountsCommand = "ca";
const transfersCommand = "tf";

const invalidText = "invalid";

const pendingText = "pending";
export const failText = "fail";
export const successText = "success";

export const beforeLoad = "전송할 대용량 작업 파일을 선택해주세요.";
export const loadingOperation = "대용량 작업 파일을 읽어오는 중입니다.";
export const afterLoad = "이제 대용량 작업을 전송할 수 있습니다";
export const sendingOperation = "대용량 작업을 전송 중입니다.";
export const stopSending = "대용량 작업 전송이 일시 중지 되었습니다.";
export const sendDone = "요청하신 작업이 모두 전송 완료 되었습니다.";

const initialState = {
    bulks: [],
    result: [],
    state: beforeLoad,
    privs: [],
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_PRIV:
            return {
                ...state,
                privs: action.privs,
            }
        case actions.CLEAR_PRIV:
            return {
                ...state,
                privs: [],
            }
        case actions.START_LOADING:
            return {
                ...state,
                state: loadingOperation,
            }
        case actions.START_SEND:
            return {
                ...state,
                state: sendingOperation,
            }
        case actions.STOP_SEND:
            return {
                ...state,
                state: stopSending,
            }
        case actions.SET_BULKS:
            return {
                ...state,
                bulks: action.bulks.map(
                    x => ({
                        type: x.type === createAccountsCommand ? createAccountText : x.type === transfersCommand ? transfersText : invalidText,
                        receiver: Object.prototype.hasOwnProperty.call(x, "receiver") ? x.receiver : null,
                        threshold: Object.prototype.hasOwnProperty.call(x, "threshold") ? x.threshold : null,
                        keys: Object.prototype.hasOwnProperty.call(x, "keys") ? x.keys : null,
                        amounts: Object.prototype.hasOwnProperty.call(x, "amounts") ? x.amounts : null,
                    })
                ).sort((x, y) => {
                    if (x.type < y.type) {
                        return 1;
                    }
                    else if (x.type > y.type) {
                        return -1;
                    }
                    return 0;
                }),
                state: afterLoad,
            };
        case actions.CLEAR_BULKS:
            return initialState;
        case actions.ADD_HASH:
            if (state.bulks.length - 1 <= state.result.length) {
                return {
                    ...state,
                    result: [...state.result, { hash: action.hash, result: pendingText }],
                    state: sendDone,
                }
            }
            return {
                ...state,
                result: [...state.result, { hash: action.hash, result: pendingText }],
            }
        case actions.SET_HASH_RESULT:
            var i = state.result.length;
            while (--i) {
                if (state.result[i].hash === action.hash) {
                    return {
                        ...state,
                        result: state.result.splice(i, 1, { hash: action.hash, result: action.result })
                    }
                }
            }
            return state;
        default:
            return state;
    }
}