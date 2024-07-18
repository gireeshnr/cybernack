import axios from 'axios';

const shodanApiKey = process.env.SHODAN_API_KEY;

export const fetchShodanData = async (domain) => {
  try {
    const response = await axios.get(`https://api.shodan.io/dns/domain/${domain}?key=${shodanApiKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Shodan data:', error.message);
    return null; // Return null on error
  }
};

export const fetchShodanHostData = async (domain) => {
  try {
    const response = await axios.get(`https://api.shodan.io/shodan/host/search?key=${shodanApiKey}&query=hostname:${domain}`);
    return response.data.matches[0] || {};
  } catch (error) {
    console.error('Error fetching Shodan host data:', error.message);
    return null; // Return null on error
  }
};
