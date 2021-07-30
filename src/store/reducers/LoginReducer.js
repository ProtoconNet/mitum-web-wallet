import * as actions from '../actions';

const initialState = {
    isLogin: false,
    account: undefined,
    history: undefined
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.LOGIN:
            return {
                ...state,
                isLogin: true,
                account: action.account
            }
        case actions.LOGOUT:
            return {
                ...state,
                isLogin: false,
                account: undefined
            }
        case actions.SET_HISTORY:
            return {
                ...state,
                history: action.history
            }
        case actions.CLEAR_HISTORY:
            return {
                ...state,
                history: undefined
            }
        default:
            return state;
    }
}