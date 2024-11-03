// client/src/actions/types.js

export const AUTH_USER = 'auth_user';
export const UNAUTH_USER = 'unauth_user';
export const AUTH_ERROR = 'auth_error';
export const GET_USER_PROFILE = 'get_user_profile';
export const UPDATE_USER_PROFILE = 'update_user_profile';
export const SIGNUP_USER = 'signup_user';
export const GET_USERS_SUCCESS = 'get_users_success';
export const CREATE_ORGANIZATION_SUCCESS = 'create_organization_success';
export const GET_ORGANIZATIONS_SUCCESS = 'get_organizations_success';
export const DELETE_ORGANIZATION_SUCCESS = 'delete_organization_success'; // For single deletion
export const DELETE_ORGANIZATIONS_SUCCESS = 'delete_organizations_success'; // For multiple deletions
export const ADD_USER_SUCCESS = 'add_user_success';
export const UPDATE_USER_SUCCESS = 'update_user_success';
export const DELETE_USERS_SUCCESS = 'delete_users_success';
export const GET_SUBSCRIPTIONS_SUCCESS = 'get_subscriptions_success';
export const CREATE_SUBSCRIPTION_SUCCESS = 'create_subscription_success';
export const UPDATE_SUBSCRIPTION_SUCCESS = 'update_subscription_success'; // Added for updating subscriptions
export const DELETE_SUBSCRIPTIONS_SUCCESS = 'delete_subscriptions_success'; // Added for deleting subscriptions
export const UPDATE_ORGANIZATION_STATUS_SUCCESS = 'update_organization_status_success';