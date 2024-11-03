import axios from 'axios';

export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('auth_jwt_token');
    if (!token) throw new Error('No token found');

    const response = await axios.post('/auth/refresh-token', { token });
    const newToken = response.data.token;
    localStorage.setItem('auth_jwt_token', newToken);
    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};