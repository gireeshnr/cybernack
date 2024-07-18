import { resolveDomainToIP } from '../services/dnsResolution.js';
import { fetchRapidDNSData } from '../services/rapidDNS.js';
import { fetchVirusTotalData } from '../services/virusTotal.js';
import { fetchGreyNoiseData } from '../services/greyNoise.js';
import { fetchZoomEyeData } from '../services/zoomEye.js';

export const threatIntelView = async (req, res) => {
  const { domain } = req.body;

  try {
    const ip = await resolveDomainToIP(domain);

    const results = await Promise.all([
      fetchRapidDNSData(domain).catch(error => ({ error: error.message })),
      fetchVirusTotalData(domain).catch(error => ({ error: error.message })),
      fetchGreyNoiseData(ip).catch(error => ({ error: error.message })), // Use IP for GreyNoise
      fetchZoomEyeData(domain).catch(error => ({ error: error.message }))
    ]);

    const rapidDNSData = results[0].error ? { error: results[0].error, source: 'RapidDNS' } : { data: results[0], source: 'RapidDNS' };
    const virusTotalData = results[1].error ? { error: results[1].error, source: 'VirusTotal' } : { data: results[1], source: 'VirusTotal' };
    const greyNoiseData = results[2].error ? { error: results[2].error, source: 'GreyNoise', ip } : { data: results[2], source: 'GreyNoise', ip };
    const zoomEyeData = results[3].error ? { error: results[3].error, source: 'ZoomEye' } : { data: results[3], source: 'ZoomEye' };

    const threatIntelData = [
      rapidDNSData,
      virusTotalData,
      greyNoiseData,
      zoomEyeData
    ];

    res.json({
      message: 'Threat intelligence gathered.',
      data: threatIntelData
    });
  } catch (error) {
    console.error('Error during threat intel view:', error);
    res.status(500).json({ error: 'An internal server error occurred during threat intel view.' });
  }
};
