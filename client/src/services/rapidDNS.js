import axios from 'axios';

const rapidDnsApiKey = config.get('rapidDnsApiKey');

export const fetchRapidDNSData = async (domain) => {
  const response = await axios.get(`https://rapidapi.com/domain-lookup/v1/${domain}`, {
    headers: {
      'x-rapidapi-host': 'domain-lookup.p.rapidapi.com',
      'x-rapidapi-key': rapidDnsApiKey
    }
  });
  return response.data;
};
