import axios from 'axios';

export const fetchAssets = async () => {
  console.log('API Call: Fetch assets');
  try {
    const response = await axios.get('/api/assets');
    console.log('API Response: Fetch assets', response.data);
    return response;
  } catch (error) {
    console.error('API Error: Fetch assets', error);
    throw error;
  }
};

export const autoDiscovery = async (domain) => {
  console.log('API Call: Auto discovery for domain:', domain);
  try {
    const response = await axios.post('/api/discovery/nmap', { domain });
    console.log('API Response: Auto discovery', response.data);
    return response;
  } catch (error) {
    console.error('API Error: Auto discovery', error);
    throw error;
  }
};

export const addOrUpdateAssets = async (assets) => {
  console.log('API Call: Add or update assets', assets);
  try {
    const response = await axios.post('/api/assets', { assets });
    console.log('API Response: Add or update assets', response.data);
    return response;
  } catch (error) {
    console.error('API Error: Add or update assets', error);
    throw error;
  }
};

export const fetchRootDomainFromOrg = async () => {
  console.log('API Call: Fetch root domain from organization');
  try {
    const response = await axios.get('/api/organization/root-domain');
    console.log('API Response: Fetch root domain from organization', response.data);
    return response;
  } catch (error) {
    console.error('API Error: Fetch root domain from organization', error);
    throw error;
  }
};

export const deleteAssets = async (assetIds) => {
  console.log('API Call: Delete assets', assetIds);
  try {
    const response = await axios.delete('/api/assets', { data: { assetIds } });
    console.log('API Response: Delete assets', response.data);
    return response;
  } catch (error) {
    console.error('API Error: Delete assets', error);
    throw error;
  }
};

export const updateAsset = async (asset) => {
  console.log('API Call: Update asset', asset);
  try {
    const response = await axios.put(`/api/assets/${asset.assetId}`, asset);
    console.log('API Response: Update asset', response.data);
    return response;
  } catch (error) {
    console.error('API Error: Update asset', error);
    throw error;
  }
};

export const fetchAssetDetail = async (assetId) => {
  console.log('API Call: Fetch asset detail');
  try {
    const response = await axios.get(`/api/assets/${assetId}`);
    console.log('API Response: Fetch asset detail', response.data);
    return response;
  } catch (error) {
    console.error('API Error: Fetch asset detail', error);
    throw error;
  }
};

export const fetchScanHistory = async (assetId) => {
  console.log('API Call: Fetch scan history for asset:', assetId);
  try {
    const response = await axios.get(`/api/scan-history/${assetId}`);
    console.log('API Response: Fetch scan history', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error: Fetch scan history', error);
    throw error;
  }
};

export const fetchZoomEyeScanResults = async (assetId) => {
  console.log('API Call: Fetch ZoomEye scan results');
  try {
    const response = await axios.get(`/api/zoomeye/results/${assetId}`);
    console.log('API Response: Fetch ZoomEye scan results', response.data);
    return response;
  } catch (error) {
    console.error('API Error: Fetch ZoomEye scan results', error);
    throw error;
  }
};

