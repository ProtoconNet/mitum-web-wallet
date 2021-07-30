import { operation } from './hint.json';

export const OPER_CREATE_ACCOUNT = 'OPER-CREATE-ACCOUNT';
export const OPER_UPDATE_KEY = 'OPER-UPDATE-KEY';
export const OPER_TRANSFER = 'OPER-TRANSFER';
export const OPER_DEFAULT = 'OPER-DEFAULT';

export const PAGE_HOME = 'PAGE-HOMEs'
export const PAGE_LOGIN = 'PAGE-LOGIN';
export const PAGE_WALLET = 'PAGE-WALLET';
export const PAGE_OPER = 'PAGE-OPER';
export const PAGE_SIGN = 'PAGE-SIGN';
export const PAGE_LOD = 'PAGE-LOD';
export const PAGE_RES = 'PAGE-RES';
export const PAGE_GEN = 'PAGE-GEN';

export const SHOW_PRIVATE = 'show-private';
export const SHOW_RESTORE = 'show-restore';

export const TYPE_CREATE_ACCOUNT = operation.create_account + '-' + process.env.REACT_APP_VERSION;
export const TYPE_UPDATE_KEY = operation.update_key + '-' + process.env.REACT_APP_VERSION;
export const TYPE_TRANSFER = operation.transfer + '-' + process.env.REACT_APP_VERSION;