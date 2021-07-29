import { combineReducers } from 'redux';
import { reducer as loginReducer } from './LoginReducer';
import { reducer as operationReducer } from './OperationReducer';

const rootReducer = combineReducers({
    login: loginReducer,
    operation: operationReducer
});

export default rootReducer;