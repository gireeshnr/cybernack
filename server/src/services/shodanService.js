import axios from 'axios';
import ShodanScanResult from '../models/ShodanScanResult.js';
import Asset from '../models/Asset.js';

const SHODAN_API_URL = 'https://api.shodan.io';
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

export const fetchShodanData = async (rootDomain) => {
  try {
    const response = await axios.get(`${SHODAN_API_URL}/shodan/host/search`, {
      params: {
        key: SHODAN_API_KEY,
        query: rootDomain,
      },
    });

    const scanData = response.data;

    // Store the raw scan data
    const shodanScanResult = new ShodanScanResult({
      domain: rootDomain,
      rawScanData: scanData,
      timestamp: new Date(),
    });

    await shodanScanResult.save();

    return scanData;
  } catch (error) {
    console.error('Error fetching Shodan data:', error.message);
    throw error;
  }
};

export const fetchShodanHostData = async (host) => {
  try {
    const response = await axios.get(`${SHODAN_API_URL}/shodan/host/${host}`, {
      params: {
        key: SHODAN_API_KEY,
      },
    });

    const hostData = response.data;

    // Store the raw scan data
    const shodanScanResult = new ShodanScanResult({
      domain: host,
      rawScanData: hostData,
      timestamp: new Date(),
    });

    await shodanScanResult.save();

    return hostData;
  } catch (error) {
    console.error('Error fetching Shodan host data:', error.message);
    throw error;
  }
};
