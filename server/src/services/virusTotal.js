import axios from 'axios';
import config from 'config';

const virusTotalApiKey = config.get('virusTotalApiKey');

export const fetchVirusTotalData = async (domain) => {
  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      headers: { 'x-apikey': virusTotalApiKey }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching VirusTotal data:', error.message);
    return {};
  }
};
