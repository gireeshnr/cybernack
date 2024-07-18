import axios from 'axios';
import config from 'config';

const censysApiID = config.get('censysApiID');
const censysApiKey = config.get('censysApiKey');

export const fetchCensysData = async (domain) => {
  try {
    const response = await axios.get(`https://search.censys.io/api/v2/hosts/search?q=${domain}`, {
      auth: {
        username: censysApiID,
        password: censysApiKey
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching Censys data:', error.message);
    return {};
  }
};
