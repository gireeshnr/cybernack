// client/src/reducers/index.js
import { combineReducers } from 'redux';
import authReducer from '../auth/reducer';
import subscriptionReducer from './subscriptionReducer';
import industryReducer from './industrySlice';
import domainReducer from './domainSlice';
import subjectReducer from './subjectSlice';
import questionReducer from './questionSlice';
import roleReducer from './roleSlice';
import trainingPathReducer from './trainingPathSlice';

// Removed: clientTrainingPathReducer

const rootReducer = combineReducers({
  auth: authReducer,
  subscription: subscriptionReducer,
  industries: industryReducer,
  domains: domainReducer,
  subjects: subjectReducer,
  questions: questionReducer,
  roles: roleReducer,
  trainingPath: trainingPathReducer,
});

export default rootReducer;