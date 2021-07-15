import * as actions from '../actions';

const initialState = {
    isLogin: false,
    account: undefined
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
        default:
            return state;
    }
}