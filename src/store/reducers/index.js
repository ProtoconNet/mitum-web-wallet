import { combineReducers } from 'redux';
import { persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage';
import { reducer as login } from './LoginReducer';
import { reducer as operation } from './OperationReducer';
import { reducer as queue } from './QueueReducer';
import { reducer as network } from './NetworkReducer';
import { reducer as page } from './PageReducer';
import { reducer as maintain } from './MaintainReducer';
import { reducer as restore } from './RestoreReducer';
import { reducer as allow } from './AllowanceReducer';

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["restore"]
};

const rootReducer = combineReducers({
    login,
    operation,
    queue,
    network,
    page,
    maintain,
    restore,
    allow,
});

export default persistReducer(persistConfig, rootReducer);