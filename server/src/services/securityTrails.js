import axios from 'axios';
import config from 'config';

const securityTrailsApiKey = config.get('securityTrailsApiKey');

export const fetchSubdomains = async (domain) => {
  try {
    const response = await axios.get(`https://api.securitytrails.com/v1/domain/${domain}/subdomains`, {
      headers: { 'APIKEY': securityTrailsApiKey }
    });
    return response.data.subdomains;
  } catch (error) {
    console.error('Error fetching SecurityTrails data:', error.message);
    return [];
  }
};
