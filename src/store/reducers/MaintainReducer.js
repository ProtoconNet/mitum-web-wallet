import * as actions from '../actions';

const initialState = {
    start: 0,
    end: 0,
    maintain: false,
    msg: {
        ko: "",
        en: ""
    }
}

export const reducer = (state = initialState, action) => {

    switch (action.type) {
        case actions.SET_MAINTAIN_INFO:
            return {
                ...state,
                start: action.info.start_time,
                end: action.info.end_time,
                maintain: action.onMaintain,
                msg: {
                    ko: action.info.message.ko,
                    en: action.info.message.en
                }
            }
        default:
            return state;
    }
}