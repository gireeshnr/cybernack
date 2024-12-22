// client/src/reducers/index.js

import { combineReducers } from 'redux';
import authReducer from '../auth/reducer';
import subscriptionReducer from './subscriptionReducer';
// OLD: import entityReducer from './entitySlice';
import industryReducer from './industrySlice'; // NEW

const rootReducer = combineReducers({
  auth: authReducer,                // Handles authentication, users, profile, and organizations
  subscription: subscriptionReducer, // Handles subscription data
  // OLD: entities: entityReducer,
  industries: industryReducer,       // NEW
});

export default rootReducer;