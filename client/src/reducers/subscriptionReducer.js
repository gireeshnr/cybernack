import { GET_SUBSCRIPTIONS_SUCCESS } from '../actions/types';

const initialState = {
  subscriptions: [],
};

const subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SUBSCRIPTIONS_SUCCESS:
      return {
        ...state,
        subscriptions: action.payload,
      };
    default:
      return state;
  }
};

export default subscriptionReducer;