import axios from 'axios';
import config from 'config';

const virusTotalApiKey = config.get('virusTotalApiKey');

export const fetchVirusTotalData = async (domain) => {
  const response = await axios.get(`https://www.virustotal.com/api/v3/domains/${domain}`, {
    headers: { 'x-apikey': virusTotalApiKey }
  });
  return response.data.data;
};
