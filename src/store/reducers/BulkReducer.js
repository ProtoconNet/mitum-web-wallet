import * as actions from '../actions';

export const createAccountText = "create-accounts";
export const transfersText = "transfers";

export const createAccountsCommand = "ca";
export const transfersCommand = "tf";

export const invalidText = "a-invalid";

export const pendingText = "pending";
export const failText = "fail";
export const successText = "success";

export const beforeLoad = "전송할 대용량 작업 파일을 선택해주세요.";
export const loadingOperation = "대용량 작업 파일을 읽어오는 중입니다.";
export const afterLoad = "이제 대용량 작업을 전송할 수 있습니다";
export const creatingOperation = "대용량 작업을 생성 중입니다.";
export const sendingOperation = "대용량 작업을 전송 중입니다.";
export const signingOperation = "대용량 작업에 서명 중입니다.";
export const stopCreating = "대용량 작업 생성이 일시 중지 되었습니다.";
export const stopSending = "대용량 작업 전송이 일시 중지 되었습니다.";
export const stopSigning = "대용량 작업 서명이 일시 중지 되었습니다.";
export const sendDone = "요청하신 작업이 모두 전송 완료 되었습니다.";
export const createDone = "요청하신 작업이 모두 생성 완료 되었습니다.";
export const signDone = "요청하신 모든 작업에 서명을 완료 하였습니다.";

const initialState = {
    bulks: [],
    result: [],
    jsons: [],
    unsigned: [],
    signed: [],
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_BULKS:
            var bulks = action.bulks.map(
                (x, idx) => ({
                    type: x.type === createAccountsCommand ? createAccountText : x.type === transfersCommand ? transfersText : invalidText,
                    receiver: Object.prototype.hasOwnProperty.call(x, "receiver") ? x.receiver : null,
                    threshold: Object.prototype.hasOwnProperty.call(x, "threshold") ? x.threshold : null,
                    keys: Object.prototype.hasOwnProperty.call(x, "keys") ? x.keys : null,
                    amounts: Object.prototype.hasOwnProperty.call(x, "amounts") ? x.amounts : null,
                    origin: action.origin[idx],
                })
            ).sort((x, y) => {
                if (x.type < y.type) {
                    return -1;
                }
                else if (x.type > y.type) {
                    return 1;
                }
                return 0;
            });
            return {
                ...state,
                bulks,
            };
        case actions.SET_UNSIGNED_OPERATION:
            return {
                ...state,
                unsigned: action.lines.map(x => JSON.parse(x))
            }
        case actions.SET_SIGNED_OPERATION:
            return {
                ...state,
                signed: action.signed
            }
        case actions.CLEAR_BULKS:
            return initialState;
        case actions.SET_RESULT:
            return {
                ...state,
                result: action.result,
            }
        case actions.SET_CREATED_RESULT:
            return {
                ...state,
                jsons: action.result,
            }
        default:
            return state;
    }
}