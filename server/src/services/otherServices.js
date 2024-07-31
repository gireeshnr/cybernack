import axios from 'axios';
import CensysScanResult from '../models/CensysScanResult.js';
import SecurityTrailsScanResult from '../models/SecurityTrailsScanResult.js';
import RapidDNSScanResult from '../models/RapidDNSScanResult.js';

const CENSYS_API_URL = 'https://search.censys.io/api/v2';
const SECURITY_TRAILS_API_URL = 'https://api.securitytrails.com/v1';
const RAPID_DNS_API_URL = 'https://rapidapi.com';

const CENSYS_API_ID = process.env.CENSYS_API_ID;
const CENSYS_API_KEY = process.env.CENSYS_API_KEY;
const SECURITY_TRAILS_API_KEY = process.env.SECURITY_TRAILS_API_KEY;
const RAPID_DNS_API_KEY = process.env.RAPID_DNS_API_KEY;

export const fetchCensysData = async (rootDomain, user) => {
  try {
    const response = await axios.get(`${CENSYS_API_URL}/hosts/search`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${CENSYS_API_ID}:${CENSYS_API_KEY}`).toString('base64')}`,
      },
      params: {
        q: rootDomain,
      },
    });

    const scanData = response.data;

    const censysScanResult = new CensysScanResult({
      domain: rootDomain,
      rawScanData: scanData,
      timestamp: new Date(),
    });

    await censysScanResult.save();

    return scanData;
  } catch (error) {
    console.error('Error fetching Censys data:', error.message);
    throw error;
  }
};

export const fetchSubdomains = async (rootDomain) => {
  try {
    const response = await axios.get(`${SECURITY_TRAILS_API_URL}/domain/${rootDomain}/subdomains`, {
      headers: {
        APIKEY: SECURITY_TRAILS_API_KEY,
      },
    });

    const scanData = response.data;

    // Store the raw scan data
    const securityTrailsScanResult = new SecurityTrailsScanResult({
      domain: rootDomain,
      rawScanData: scanData,
      timestamp: new Date(),
    });

    await securityTrailsScanResult.save();

    return scanData;
  } catch (error) {
    console.error('Error fetching subdomains from SecurityTrails:', error.message);
    throw error;
  }
};

export const fetchRapidDNSData = async (rootDomain) => {
  try {
    const response = await axios.get(`${RAPID_DNS_API_URL}/dns/${rootDomain}`, {
      headers: {
        'x-rapidapi-key': RAPID_DNS_API_KEY,
        'x-rapidapi-host': 'YOUR_RAPID_DNS_HOST', // Replace with the actual host if needed
      },
    });

    const scanData = response.data;

    // Store the raw scan data
    const rapidDNSScanResult = new RapidDNSScanResult({
      domain: rootDomain,
      rawScanData: scanData,
      timestamp: new Date(),
    });

    await rapidDNSScanResult.save();

    return scanData;
  } catch (error) {
    console.error('Error fetching RapidDNS data:', error.message);
    throw error;
  }
};
