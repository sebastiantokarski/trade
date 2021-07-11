import { combineReducers } from '@reduxjs/toolkit';
import pageInfoReducer from '../slices/pageInfoSlice';
import accountReducer from '../slices/accountSlice';
import positionReducer from '../slices/positionSlice';

const rootReducer = combineReducers({
  account: accountReducer,
  pageInfo: pageInfoReducer,
  position: positionReducer,
});

export default rootReducer;
