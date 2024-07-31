import User from '../models/user.js';
import Asset from '../models/Asset.js';
import ScanResult from '../models/NmapScanResult.js';
import ZoomEyeScanResult from '../models/ZoomEyeScanResult.js';
import logger from '../util/logger.js'; // Ensure you have a logger utility
import { runZoomEyeDiscovery } from '../services/zoomeyeService.js';
import { runNmapDiscovery } from '../services/nmapService.js';
import { fetchShodanHostData, fetchShodanData } from '../services/shodanService.js';
import { fetchCensysData, fetchSubdomains, fetchRapidDNSData } from '../services/otherServices.js';
import { mergeAssetData } from '../util/mergeAsset.js';

// Fetch assets for a specific organization
export const getAssets = async (req, res) => {
  try {
    logger.info(`Fetching assets for organization ID: ${req.user.org}`);
    const assets = await Asset.find({ org: req.user.org }).populate('org');
    logger.info(`Fetched assets: ${JSON.stringify(assets, null, 2)}`);
    res.status(200).json(assets);
  } catch (error) {
    logger.error('Error fetching assets:', error);
    res.status(500).json({ error: 'An error occurred while fetching assets' });
  }
};

// Delete assets for a specific organization
export const deleteAssets = async (req, res) => {
  try {
    const { assetIds } = req.body;
    logger.info(`Deleting assets with IDs: ${assetIds} for organization ID: ${req.user.org}`);
    await Asset.deleteMany({ _id: { $in: assetIds }, org: req.user.org });
    logger.info('Assets deleted successfully');
    res.status(200).json({ message: 'Assets deleted successfully' });
  } catch (error) {
    logger.error('Error deleting assets:', error);
    res.status(500).json({ error: 'An error occurred while deleting assets' });
  }
};

// View discovery results for a specific domain
export const discoveryView = async (req, res) => {
  const { domain } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.error('User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    let subdomains = ['www']; // Default to a single subdomain if none found

    // Fetch subdomains from Shodan
    try {
      const shodanData = await fetchShodanData(domain, user.org);
      if (shodanData && shodanData.subdomains && shodanData.subdomains.length > 0) {
        subdomains = shodanData.subdomains;
      }
    } catch (error) {
      logger.warn('Shodan error:', error.message);
    }

    const assets = await Promise.all(subdomains.map(async (subdomain) => {
      const fullDomain = `${subdomain}.${domain}`;
      let hostData = {};

      // Fetch host data from Shodan
      try {
        hostData = await fetchShodanHostData(fullDomain);
      } catch (error) {
        logger.warn('Shodan host search error:', error.message);
      }

      // Fetch data from other sources
      const results = await Promise.all([
        fetchCensysData(fullDomain).catch(error => ({ error: error.message })),
        fetchSubdomains(fullDomain).catch(error => ({ error: error.message })),
        fetchRapidDNSData(fullDomain).catch(error => ({ error: error.message })),
        runZoomEyeDiscovery(fullDomain, user).catch(error => ({ error: error.message })),
        runNmapDiscovery(fullDomain, user).catch(error => ({ error: error.message })),
      ]);

      const censysData = results[0]?.error ? null : { data: results[0], source: 'Censys' };
      const securityTrailsData = results[1]?.error ? null : { data: results[1], source: 'SecurityTrails' };
      const rapidDNSData = results[2]?.error ? null : { data: results[2], source: 'RapidDNS' };
      const zoomEyeData = results[3]?.error ? null : { data: results[3], source: 'ZoomEye' };
      const nmapData = results[4]?.error ? null : { data: results[4], source: 'Nmap' };

      const assetData = [
        censysData,
        securityTrailsData,
        rapidDNSData,
        zoomEyeData,
        nmapData,
      ].filter(data => data !== null).map(data => ({
        domain: fullDomain,
        type: 'subdomain',
        org: user.org,
        ip: hostData?.ip_str || 'N/A',
        ports: hostData?.ports || [],
        source: data.source,
        ...data.data,
      }));

      return assetData;
    }));

    const consolidatedAssets = assets.flat().reduce((acc, asset) => {
      const existing = acc.find(a => a.domain === asset.domain && a.org.equals(asset.org));
      if (existing) {
        existing.ports = [...new Set([...existing.ports, ...asset.ports])];
        existing.sources[asset.source] = asset.lastSeen || new Date();
      } else {
        acc.push({ ...asset, sources: { [asset.source]: new Date() } });
      }
      return acc;
    }, []);

    // Update the assets in the database
    for (const asset of consolidatedAssets) {
      await Asset.updateOne(
        { domain: asset.domain, org: asset.org },
        { $set: asset },
        { upsert: true }
      );
    }

    logger.info(`Discovery completed for domain: ${domain}, assets: ${JSON.stringify(consolidatedAssets, null, 2)}`);
    res.json({ message: 'Discovery completed.', assets: consolidatedAssets });
  } catch (error) {
    logger.error('Error during discovery view:', error);
    res.status(500).json({ error: 'An internal server error occurred during discovery view.' });
  }
};

// Fetch details of a specific asset
export const getAssetDetail = async (req, res) => {
  try {
    const { assetId } = req.params;
    logger.info(`Fetching asset detail for asset ID: ${assetId}`);
    const asset = await Asset.findOne({ _id: assetId, org: req.user.org }).populate('org');
    if (!asset) {
      logger.error('Asset not found');
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Fetch scan results for the asset's domain
    const scanResults = await ScanResult.find({ org: req.user.org, 'additionalFields.rawXML': { $regex: new RegExp(asset.domain, 'i') } });
    logger.info(`Fetched asset detail: ${JSON.stringify(asset, null, 2)}`);
    logger.info(`Fetched scan results: ${JSON.stringify(scanResults, null, 2)}`);

    res.status(200).json({ asset, scanResults });
  } catch (error) {
    logger.error('Error fetching asset detail:', error);
    res.status(500).json({ error: 'An error occurred while fetching asset detail' });
  }
};
