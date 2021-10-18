import * as actions from '../actions';

const initialState = {
    isSet: false,
    verify: "",
    priv: "",
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_RESTORE_KEY:
            return {
                ...state,
                isSet: true,
                priv: action.priv,
                verify: action.verify,
            };
        case actions.CLEAR_RESTORE_KEY:
            return {
                ...state,
                isSet: false,
                priv: "",
                verify: "",
            }
        default:
            return state;
    }
}