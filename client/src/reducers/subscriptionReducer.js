import { GET_SUBSCRIPTIONS_SUCCESS } from '../actions/types';

const initialState = {
  subscriptions: [],
};

const subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SUBSCRIPTIONS_SUCCESS:
      return {
        ...state,
        subscriptions: action.payload, // Store all fetched subscriptions
      };
    default:
      return state;
  }
};

export default subscriptionReducer;