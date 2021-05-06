import { combineReducers } from '@reduxjs/toolkit';
import balanceReducer from '../slices/balanceSlice';
import accountReducer from '../slices/accountSlice';

const rootReducer = combineReducers({
  balance: balanceReducer,
  account: accountReducer,
});

export default rootReducer;
