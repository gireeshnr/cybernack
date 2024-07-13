import axios from 'axios';
import Asset from '../models/Asset.js';
import User from '../models/user.js';

const shodanApiKey = process.env.SHODAN_API_KEY;

export const autoDiscovery = async (req, res) => {
  const { domain } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const shodanResponse = await axios.get(`https://api.shodan.io/dns/domain/${domain}?key=${shodanApiKey}`);
    const subdomains = shodanResponse.data.subdomains;

    const assets = await Promise.all(subdomains.map(async (subdomain) => {
      const fullDomain = `${subdomain}.${domain}`;
      const hostResponse = await axios.get(`https://api.shodan.io/shodan/host/search?key=${shodanApiKey}&query=hostname:${fullDomain}`);
      const hostData = hostResponse.data.matches[0] || {};

      return {
        domain: fullDomain,
        type: 'subdomain',
        org: user.org,
        ip: hostData.ip_str || 'N/A',
        ports: hostData.ports || [],
      };
    }));

    res.json({ message: 'Discovery completed.', assets });
  } catch (error) {
    console.error('Error during auto-discovery:', error);
    res.status(500).json({ error: 'An error occurred during auto-discovery.' });
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
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'An error occurred while fetching assets.' });
  }
};

export const deleteAssets = async (req, res) => {
  const { assetIds } = req.body;

  try {
    await Asset.deleteMany({ _id: { $in: assetIds } });
    res.json({ message: 'Assets deleted successfully.' });
  } catch (error) {
    console.error('Error deleting assets:', error);
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
    console.error('Error updating asset:', error);
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
    console.error('Error adding/updating assets:', error);
    res.status(500).json({ error: 'An error occurred while adding/updating assets.' });
  }
};
