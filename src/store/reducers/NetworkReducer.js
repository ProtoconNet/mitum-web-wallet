import * as actions from '../actions';

const initialState = {
    network: process.env.REACT_APP_API_URL,
    networkAccount: process.env.REACT_APP_API_ACCOUNT,
    networkBroadcast: process.env.REACT_APP_API_BROADCAST,
    networkSearchFact: process.env.REACT_APP_API_SEARCH_FACT,
    networkId: process.env.REACT_APP_NETWORK_ID,
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.SET_NETWORK:
            return {
                ...state,
                network: action.network,
                networkAccount: action.network + '/account/',
                networkBroadcast: action.network + '/builder/send',
                networkSearchFact: action.network + '/operation/'
            };
        case actions.CLEAR_NETWORK:
            return {
                ...state,
                network: process.env.REACT_APP_API_URL,
                networkAccount: process.env.REACT_APP_API_ACCOUNT,
                networkBroadcast: process.env.REACT_APP_API_BROADCAST,
                networkSearchFact: process.env.REACT_APP_API_SEARCH_FACT,
            }
        case actions.SET_NETWORK_ID:
            return {
                ...state,
                networkId: action.id
            }
        case actions.CLEAR_NETWORK_ID:
            return {
                ...state,
                networkId: process.env.REACT_APP_NETWORK_ID
            }
        default:
            return state;
    }
}