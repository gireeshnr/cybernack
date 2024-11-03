// client/src/reducers/index.js

import { combineReducers } from 'redux';
import authReducer from '../auth/reducer';
import subscriptionReducer from './subscriptionReducer';

const rootReducer = combineReducers({
  auth: authReducer,            // Handles authentication, users, profile, and organizations
  subscription: subscriptionReducer, // Handles subscription data
});

export default rootReducer;