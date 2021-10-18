import { PAGE_NON, PAGE_QR } from '../../text/mode';
import * as actions from '../actions';

const initialState = {
    pageBefore: PAGE_NON
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_PAGE:
            return {
                ...state,
                pageBefore: PAGE_QR
            };
        case actions.CLEAR_PAGE:
            return {
                ...state,
                pageBefore: PAGE_NON
            }
        default:
            return state;
    }
}