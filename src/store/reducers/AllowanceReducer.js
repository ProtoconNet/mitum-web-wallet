import * as actions from '../actions';

const initialState = {
    isLoginAllowed: false,
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.ALLOW_LOGIN:
            return {
                ...state,
                isLoginAllowed: true
            };
        case actions.REJECT_LOGIN:
            return {
                ...state,
                isLoginAllowed: false,
            }
        default:
            return state;
    }
}