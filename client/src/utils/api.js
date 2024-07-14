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
