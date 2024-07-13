import { SIGNUP_USER, GET_USER_PROFILE, UPDATE_USER_PROFILE } from '../actions/types';

const initialState = {
  user: null,
  profile: null,
  token: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SIGNUP_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
      };
    case GET_USER_PROFILE:
      return {
        ...state,
        profile: action.payload
      };
    case UPDATE_USER_PROFILE:
      return {
        ...state,
        profile: action.payload
      };
    default:
      return state;
  }
}
