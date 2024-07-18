import axios from 'axios';

export const fetchAssets = async () => {
  return axios.get('/api/assets');
};

export const autoDiscovery = async (domain) => {
  return axios.post('/api/assets/auto-discovery', { domain });
};

export const addOrUpdateAssets = async (assets) => {
  return axios.post('/api/assets/add-or-update', { assets });
};

export const deleteAssets = async (assetIds) => {
  return axios.post('/api/assets/delete', { assetIds });
};

export const updateAsset = async (asset) => {
  return axios.post('/api/assets/update', asset);
};

export const fetchThreatIntel = async (domain) => {
  const response = await axios.post('/api/assets/threat-intel-view', { domain });
  return response.data;
};

export const fetchRootDomainFromOrg = async () => {
  try {
    const response = await axios.get('/api/organization/root-domain', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;  // Assuming it returns { "Root Domain": "example.com" }
  } catch (error) {
    console.error('Failed to fetch root domain:', error);
    throw error;
  }
};
