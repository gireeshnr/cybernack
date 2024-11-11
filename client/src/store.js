import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat((storeAPI) => (next) => (action) => {
      console.log('Dispatching action:', action);
      return next(action);
    }),
});