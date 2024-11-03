// client/src/auth/reducer.js

import {
  AUTH_USER,
  AUTH_ERROR,
  UNAUTH_USER,
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
  GET_USERS_SUCCESS,
  GET_ORGANIZATIONS_SUCCESS,
  CREATE_ORGANIZATION_SUCCESS,
  DELETE_ORGANIZATIONS_SUCCESS,
} from '../actions/types';

const INITIAL_STATE = {
  authenticated: !!localStorage.getItem('auth_jwt_token'),
  errorMessage: '',
  profile: null,
  organizations: [],  // Stores organizations
  users: [],          // Stores users
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case AUTH_USER:
      return { ...state, authenticated: true, errorMessage: '' };
    case UNAUTH_USER:
      return { ...state, authenticated: false, errorMessage: '', profile: null };
    case AUTH_ERROR:
      return { ...state, errorMessage: action.payload };
    case GET_USER_PROFILE:
      return { ...state, profile: action.payload };
    case UPDATE_USER_PROFILE:
      return { ...state, profile: action.payload };
    case GET_USERS_SUCCESS:
      return { ...state, users: action.payload };
    case GET_ORGANIZATIONS_SUCCESS:
      return { ...state, organizations: action.payload };
    case CREATE_ORGANIZATION_SUCCESS:
      return { ...state, organizations: [...state.organizations, action.payload.organization] };
    case DELETE_ORGANIZATIONS_SUCCESS:
      return { 
        ...state, 
        organizations: state.organizations.filter(org => !action.payload.includes(org._id)) 
      };
    default:
      return state;
  }
}