import axios from 'axios';
import config from 'config';

const greyNoiseApiKey = config.get('greyNoiseApiKey');

export const fetchGreyNoiseData = async (ip) => {
  try {
    const response = await axios.get(`https://api.greynoise.io/v3/community/${ip}`, {
      headers: { 'key': greyNoiseApiKey }
    });
    if (response.data && response.data.noise === false && response.data.riot === false) {
      return { ip, message: 'IP not observed scanning the internet or contained in RIOT data set.' };
    }
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { ip, message: 'IP not observed in GreyNoise dataset.' };
    }
    console.error('Error fetching GreyNoise data:', error.message);
    return { ip, message: 'Error fetching GreyNoise data' };
  }
};
