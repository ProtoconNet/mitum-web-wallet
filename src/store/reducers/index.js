import { combineReducers } from 'redux';
import { reducer as loginReducer } from './LoginReducer';
import { reducer as operationReducer } from './OperationReducer';
import { reducer as queueReducer } from './QueueReducer';
import { reducer as networkReducer } from './NetworkReducer';
import { reducer as pageReducer } from './PageReducer';
import { reducer as maintainReducer } from './MaintainReducer';

const rootReducer = combineReducers({
    login: loginReducer,
    operation: operationReducer,
    queue: queueReducer,
    network: networkReducer,
    page: pageReducer,
    maintain: maintainReducer,
});

export default rootReducer;