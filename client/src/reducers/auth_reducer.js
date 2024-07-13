import { AUTH_USER, AUTH_ERROR, UNAUTH_USER } from '../actions/types';

const INITIAL_STATE = {
  authenticated: !!localStorage.getItem('auth_jwt_token'), // Convert to boolean
  errorMessage: ''
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case AUTH_USER:
      return { ...state, authenticated: true, errorMessage: '' };
    case UNAUTH_USER:
      return { ...state, authenticated: false, errorMessage: '' };
    case AUTH_ERROR:
      return { ...state, errorMessage: action.payload };
    default:
      return state;
  }
}
