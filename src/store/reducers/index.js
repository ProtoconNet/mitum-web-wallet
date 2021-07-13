import { combineReducers } from 'redux';
import { reducer as loginReducer } from './LoginReducer';

const rootReducer = combineReducers({
    login: loginReducer
});

export default rootReducer;