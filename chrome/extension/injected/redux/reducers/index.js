import { combineReducers } from '@reduxjs/toolkit';
import balanceReducer from '../slices/balanceSlice';

const rootReducer = combineReducers({
  balance: balanceReducer,
});

export default rootReducer;
