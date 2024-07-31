import User from '../models/user.js';
import { runNmapDiscovery as runNmapDiscoveryService } from '../services/nmapService.js';
import { runZoomEyeDiscovery as runZoomEyeDiscoveryService } from '../services/zoomeyeService.js';
import { fetchShodanData as runShodanDiscoveryService } from '../services/shodanService.js';
import { fetchCensysData as runCensysDiscoveryService } from '../services/otherServices.js';

const runService = async (serviceFunction, rootDomain, user, serviceName) => {
  try {
    return await serviceFunction(rootDomain, user);
  } catch (error) {
    console.error(`Error during ${serviceName} scan:`, error);
    return { error: error.message };
  }
};

export const runNmapDiscovery = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id).populate('org');
    if (!user || !user.org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const rootDomain = user.org.rootDomain;
    const result = await runService(runNmapDiscoveryService, rootDomain, user, 'NMAP');

    res.status(200).json(result);
  } catch (error) {
    console.error('Error during NMAP discovery:', error);
    res.status(500).json({ error: error.message });
  }
};

export const runZoomEyeDiscovery = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id).populate('org');
    if (!user || !user.org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const rootDomain = user.org.rootDomain;
    const result = await runService(runZoomEyeDiscoveryService, rootDomain, user, 'ZoomEye');

    res.status(200).json(result);
  } catch (error) {
    console.error('Error during ZoomEye discovery:', error);
    res.status(500).json({ error: error.message });
  }
};

export const runShodanDiscovery = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id).populate('org');
    if (!user || !user.org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const rootDomain = user.org.rootDomain;
    const result = await runService(runShodanDiscoveryService, rootDomain, user, 'Shodan');

    res.status(200).json(result);
  } catch (error) {
    console.error('Error during Shodan discovery:', error);
    res.status(500).json({ error: error.message });
  }
};

export const runCensysDiscovery = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await User.findById(id).populate('org');
    if (!user || !user.org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const rootDomain = user.org.rootDomain;
    const result = await runService(runCensysDiscoveryService, rootDomain, user, 'Censys');

    res.status(200).json(result);
  } catch (error) {
    console.error('Error during Censys discovery:', error);
    res.status(500).json({ error: error.message });
  }
};
