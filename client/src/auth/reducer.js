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
  GET_SUBSCRIPTIONS_SUCCESS,
} from '../actions/types';

const INITIAL_STATE = {
  authenticated: !!localStorage.getItem('auth_jwt_token'),
  errorMessage: '',
  profile: null,
  organizations: [],
  users: [],
  subscriptions: [],
  loadingOrganizations: false,
  loadingSubscriptions: false,
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case AUTH_USER:
      return { ...state, authenticated: true, errorMessage: '' };
    case UNAUTH_USER:
      return { ...state, authenticated: false, errorMessage: '', profile: null };
    case AUTH_ERROR:
      return { ...state, authenticated: false, errorMessage: action.payload };
    case GET_USER_PROFILE:
      console.log('Profile received:', action.payload);
      return { ...state, profile: action.payload };
    case UPDATE_USER_PROFILE:
      return { ...state, profile: action.payload };
    case GET_USERS_SUCCESS:
      return { ...state, users: action.payload };
    case GET_ORGANIZATIONS_SUCCESS:
      return { ...state, organizations: action.payload, loadingOrganizations: false };
    case CREATE_ORGANIZATION_SUCCESS:
      return { ...state, organizations: [...state.organizations, action.payload.organization] };
    case DELETE_ORGANIZATIONS_SUCCESS:
      return {
        ...state,
        organizations: state.organizations.filter((org) => !action.payload.includes(org._id)),
      };
    case GET_SUBSCRIPTIONS_SUCCESS:
      console.log('Subscriptions loaded:', action.payload);
      return { ...state, subscriptions: action.payload, loadingSubscriptions: false };
    case 'ORGANIZATIONS_LOADING':
      return { ...state, loadingOrganizations: action.payload };
    case 'SUBSCRIPTIONS_LOADING':
      return { ...state, loadingSubscriptions: action.payload };
    default:
      return state;
  }
}