import axios from 'axios';
import config from 'config';

const securityTrailsApiKey = config.get('securityTrailsApiKey');

export const fetchSubdomains = async (domain) => {
  const response = await axios.get(`https://api.securitytrails.com/v1/domain/${domain}/subdomains`, {
    headers: { 'APIKEY': securityTrailsApiKey }
  });
  return response.data.subdomains;
};
