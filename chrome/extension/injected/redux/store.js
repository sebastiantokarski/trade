import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const loggerMiddleware = createLogger({ collapsed: true });

const storeDev = configureStore({
  reducer: rootReducer,
  middleware: [thunk, loggerMiddleware],
});

const storeProd = configureStore({
  reducer: rootReducer,
  devTools: false,
  middleware: [thunk],
});

const store = process.env.NODE_ENV === 'production' ? storeProd : storeDev;

export default store;
