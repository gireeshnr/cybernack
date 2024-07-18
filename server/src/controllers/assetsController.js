import axios from 'axios';
import Asset from '../models/Asset.js';
import User from '../models/user.js';
import { fetchSubdomains } from '../services/securityTrails.js';
import { fetchCensysData } from '../services/censys.js';
import { fetchRapidDNSData } from '../services/rapidDNS.js';
import { fetchZoomEyeData } from '../services/zoomEye.js';
import { fetchShodanData, fetchShodanHostData } from '../services/shodan.js';
import logger from '../util/logger.js';

export const discoveryView = async (req, res) => {
  const { domain } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    let subdomains = ['www']; // Default to a single subdomain if none found

    try {
      const shodanData = await fetchShodanData(domain);
      if (shodanData && shodanData.subdomains && shodanData.subdomains.length > 0) {
        subdomains = shodanData.subdomains;
      }
    } catch (error) {
      console.warn('Shodan error:', error.message);
    }

    const assets = await Promise.all(subdomains.map(async (subdomain) => {
      const fullDomain = `${subdomain}.${domain}`;
      let hostData = {};

      try {
        hostData = await fetchShodanHostData(fullDomain);
      } catch (error) {
        console.warn('Shodan host search error:', error.message);
      }

      const results = await Promise.all([
        fetchCensysData(fullDomain).catch(error => ({ error: error.message })),
        fetchSubdomains(fullDomain).catch(error => ({ error: error.message })),
        fetchRapidDNSData(fullDomain).catch(error => ({ error: error.message })),
        fetchZoomEyeData(fullDomain).catch(error => ({ error: error.message }))
      ]);

      const censysData = results[0]?.error ? null : { data: results[0], source: 'Censys' };
      const securityTrailsData = results[1]?.error ? null : { data: results[1], source: 'SecurityTrails' };
      const rapidDNSData = results[2]?.error ? null : { data: results[2], source: 'RapidDNS' };
      const zoomEyeData = results[3]?.error ? null : { data: results[3], source: 'ZoomEye' };

      const assetData = [
        censysData,
        securityTrailsData,
        rapidDNSData,
        zoomEyeData
      ].filter(data => data !== null).map(data => ({
        domain: fullDomain,
        type: 'subdomain',
        org: user.org,
        ip: hostData?.ip_str || 'N/A',
        ports: hostData?.ports || [],
        source: data.source,
        ...data.data
      }));

      return assetData;
    }));

    res.json({ message: 'Discovery completed.', assets: assets.flat() });
  } catch (error) {
    console.error('Error during discovery view:', error);
    res.status(500).json({ error: 'An internal server error occurred during discovery view.' });
  }
};

export const getAssets = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const assets = await Asset.find({ org: user.org });
    res.json(assets);
  } catch (error) {
    logger.error('Error fetching assets:', error);
    res.status(500).json({ error: 'An error occurred while fetching assets.' });
  }
};

export const deleteAssets = async (req, res) => {
  const { assetIds } = req.body;

  try {
    await Asset.deleteMany({ _id: { $in: assetIds } });
    res.json({ message: 'Assets deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting assets:', error);
    res.status(500).json({ error: 'An error occurred while deleting assets.' });
  }
};

export const updateAsset = async (req, res) => {
  const { assetId, domain, type, ip, ports } = req.body;

  try {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    asset.domain = domain;
    asset.type = type;
    asset.ip = ip;
    asset.ports = ports;
    await asset.save();

    res.json({ message: 'Asset updated successfully.', asset });
  } catch (error) {
    logger.error('Error updating asset:', error);
    res.status(500).json({ error: 'An error occurred while updating the asset.' });
  }
};

export const addOrUpdateAssets = async (req, res) => {
  const { assets } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const bulkOps = assets.map((asset) => ({
      updateOne: {
        filter: { domain: asset.domain, org: user.org },
        update: { $set: asset },
        upsert: true,
      },
    }));

    await Asset.bulkWrite(bulkOps);

    res.json({ message: 'Assets added/updated successfully.' });
  } catch (error) {
    logger.error('Error adding/updating assets:', error);
    res.status(500).json({ error: 'An error occurred while adding/updating assets.' });
  }
};
