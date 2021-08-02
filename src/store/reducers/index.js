import { combineReducers } from 'redux';
import { reducer as loginReducer } from './LoginReducer';
import { reducer as operationReducer } from './OperationReducer';
import { reducer as queueReducer} from './QueueReducer';


const rootReducer = combineReducers({
    login: loginReducer,
    operation: operationReducer,
    queue: queueReducer,
});

export default rootReducer;