import axios from 'axios';
import config from 'config';

const rapidDnsApiKey = config.get('rapidDnsApiKey');

export const fetchRapidDNSData = async (domain) => {
  try {
    const response = await axios.get(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
      headers: {
        'Accept': 'application/dns-json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { message: 'No DNS data found for the provided domain.' };
    }
    console.error('Error fetching RapidDNS data:', error.message);
    return {};
  }
};
