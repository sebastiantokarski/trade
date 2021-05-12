import { combineReducers } from '@reduxjs/toolkit';
import balanceReducer from '../slices/balanceSlice';
import accountReducer from '../slices/accountSlice';
import positionReducer from '../slices/positionSlice';

const rootReducer = combineReducers({
  balance: balanceReducer,
  account: accountReducer,
  position: positionReducer,
});

export default rootReducer;
