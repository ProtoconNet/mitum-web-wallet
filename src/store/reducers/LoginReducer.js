import * as actions from '../actions';

const initialState = {
    isLogin: false,
    account: undefined,
    history: undefined,
    isLoadHistory: false,
    priv: "",
    pub: "",
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_KEYPAIR:
            return {
                ...state,
                priv: action.priv,
                pub: action.pub,
            }
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
                history: action.history,
                isLoadHistory: true
            }
        case actions.CLEAR_HISTORY:
            return {
                ...state,
                history: undefined,
                isLoadHistory: false
            }
        default:
            return state;
    }
}