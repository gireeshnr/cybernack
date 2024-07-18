import axios from 'axios';
import config from 'config';

const greyNoiseApiKey = config.get('greyNoiseApiKey');

export const fetchGreyNoiseData = async (ip) => {
  try {
    const response = await axios.get(`https://api.greynoise.io/v3/community/${ip}`, {
      headers: { 'key': greyNoiseApiKey }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { message: 'IP not observed in GreyNoise dataset.' };
    }
    console.error('Error fetching GreyNoise data:', error.message);
    throw error;
  }
};
