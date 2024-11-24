// Authentication-related action types
export const AUTH_USER = 'auth_user'; // User successfully authenticated
export const UNAUTH_USER = 'unauth_user'; // User logged out
export const AUTH_ERROR = 'auth_error'; // Error during authentication

// User profile-related action types
export const GET_USER_PROFILE = 'get_user_profile'; // Fetch user profile
export const UPDATE_USER_PROFILE = 'update_user_profile'; // Update user profile
export const SIGNUP_USER = 'signup_user'; // User sign-up action

// User management-related action types
export const GET_USERS_SUCCESS = 'get_users_success'; // Fetch users
export const ADD_USER_SUCCESS = 'add_user_success'; // Add a new user
export const UPDATE_USER_SUCCESS = 'update_user_success'; // Update user details
export const DELETE_USERS_SUCCESS = 'delete_users_success'; // Delete users

// Organization-related action types
export const CREATE_ORGANIZATION_SUCCESS = 'create_organization_success'; // Create a new organization
export const GET_ORGANIZATIONS_SUCCESS = 'get_organizations_success'; // Fetch organizations
export const DELETE_ORGANIZATION_SUCCESS = 'delete_organization_success'; // Delete a single organization
export const DELETE_ORGANIZATIONS_SUCCESS = 'delete_organizations_success'; // Delete multiple organizations
export const UPDATE_ORGANIZATION_STATUS_SUCCESS = 'update_organization_status_success'; // Update organization status

// Subscription management-related action types
export const GET_SUBSCRIPTIONS_SUCCESS = 'get_subscriptions_success'; // Fetch subscriptions
export const CREATE_SUBSCRIPTION_SUCCESS = 'create_subscription_success'; // Create a new subscription
export const UPDATE_SUBSCRIPTION_SUCCESS = 'update_subscription_success'; // Update an existing subscription
export const DELETE_SUBSCRIPTIONS_SUCCESS = 'delete_subscriptions_success'; // Delete subscriptions