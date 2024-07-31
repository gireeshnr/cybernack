import axios from 'axios';
import ZoomEyeScanResult from '../models/ZoomEyeScanResult.js';
import Asset from '../models/Asset.js';

const ZOOMEYE_API_URL = 'https://api.zoomeye.hk/host/search';
const ZOOMEYE_API_KEY = process.env.ZOOM_EYE_API_KEY;

console.log('ZOOM_EYE_API_KEY:', ZOOMEYE_API_KEY); // Added logging

export const runZoomEyeScan = async (query) => {
  console.log('Using ZoomEye API Key:', ZOOMEYE_API_KEY); // Added logging to verify the key
  try {
    const response = await axios.get(ZOOMEYE_API_URL, {
      headers: { 'API-KEY': ZOOMEYE_API_KEY },
      params: { query },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('Error: Unauthorized. Please check your ZoomEye API key.');
    } else {
      console.error('Error fetching ZoomEye data:', error.message);
    }
    throw error;
  }
};

export const runZoomEyeDiscovery = async (rootDomain, user) => {
  try {
    const zoomEyeResults = await runZoomEyeScan(rootDomain);
    const { matches, facets, total } = zoomEyeResults;

    // Store the raw scan data in the ZoomEyeScanResult collection
    const scanResult = await ZoomEyeScanResult.findOneAndUpdate(
      { org: user.org._id, target: rootDomain, source: 'zoomeye' },
      {
        org: user.org._id,
        user: user._id,
        source: 'zoomeye',
        target: rootDomain,
        scanInfo: JSON.stringify({ facets, total }), // Convert to JSON string
        additionalFields: { rawJSON: zoomEyeResults },
      },
      { new: true, upsert: true, strict: false }
    );

    // Process each match and update or create the asset
    for (const match of matches) {
      const { ip, os, portinfo } = match;
      const status = portinfo ? portinfo.state : 'unknown';
      const ports = portinfo ? [{ port: portinfo.port, service: portinfo.service, state: portinfo.state }] : [];

      const existingAsset = await Asset.findOne({ domain: rootDomain, org: user.org._id });

      if (existingAsset) {
        existingAsset.ip = ip;
        existingAsset.os = os;
        existingAsset.ports = ports;
        existingAsset.status = status;
        existingAsset.sources.set('zoomeye', new Date());
        existingAsset.lastSeen = new Date();
        await existingAsset.save();
      } else {
        const newAsset = new Asset({
          domain: rootDomain,
          type: 'host',
          org: user.org._id,
          ip,
          os,
          ports,
          status,
          identifier: `${ip}-${Date.now()}`, // Ensure identifier is unique
          sources: new Map([['zoomeye', new Date()]]),
          lastSeen: new Date(),
        });
        await newAsset.save();
      }
    }

    return { message: 'ZoomEye scan completed and results saved.' };
  } catch (error) {
    console.error('Error during ZoomEye scan:', error);
    throw new Error(error.message);
  }
};
