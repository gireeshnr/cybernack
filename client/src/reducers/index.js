import { combineReducers } from 'redux';
import authReducer from '../auth/reducer';
import subscriptionReducer from './subscriptionReducer';
import industryReducer from './industrySlice';
import domainReducer from './domainSlice';
import subjectReducer from './subjectSlice'; // existing
import questionReducer from './questionSlice'; // NEW

const rootReducer = combineReducers({
  auth: authReducer,
  subscription: subscriptionReducer,
  industries: industryReducer,
  domains: domainReducer,
  subjects: subjectReducer,
  // NEW: Add question slice
  questions: questionReducer,
});

export default rootReducer;
