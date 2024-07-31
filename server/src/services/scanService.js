import axios from 'axios';
import { exec } from 'child_process';
import ZoomEyeScanResult from '../models/ZoomEyeScanResult.js';
import NmapScanResult from '../models/NmapScanResult.js';
import Asset from '../models/Asset.js';

const ZOOMEYE_API_URL = 'https://api.zoomeye.org/host/search';
const ZOOMEYE_API_KEY = process.env.ZOOM_EYE_API_KEY;

export const runNmapScan = (rootDomain) => {
  return new Promise((resolve, reject) => {
    exec(`nmap -A -T4 -oX - ${rootDomain}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Nmap scan error: ${error}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`Nmap scan stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

export const saveNmapScanResult = async (orgId, userId, rootDomain, scanData) => {
  const scanResult = new NmapScanResult({
    org: orgId,
    user: userId,
    source: 'nmap',
    scanInfo: {
      type: 'nmap',
      protocol: scanData.protocol,
      numservices: scanData.numservices,
      services: scanData.services
    },
    runStats: scanData.runStats,
    additionalFields: scanData,
    createdAt: new Date()
  });

  await scanResult.save();

  const { ip, os, ports, status } = scanData;
  await Asset.updateOne(
    { domain: rootDomain, org: orgId },
    {
      $set: {
        ip,
        os,
        ports,
        status,
        sources: { nmap: new Date() },
        lastSeen: new Date()
      }
    },
    { upsert: true }
  );
};

export const runZoomEyeScan = async (query) => {
  try {
    const response = await axios.get(ZOOMEYE_API_URL, {
      headers: { 'Authorization': `JWT ${ZOOMEYE_API_KEY}` },
      params: { query },
    });
    const data = response.data;
    const hosts = data.matches.map(match => ({
      address: match.ip,
      os: match.os,
      ports: match.portinfo,
      status: match.status,
      hostnames: match.hostname || [],
      times: match.times || null,
      tcpSequence: match.tcpSequence || null,
      ipIdSequence: match.ipIdSequence || null,
      tcpTimestampSeq: match.tcptssequence || null,
      distance: match.distance || null,
      traceroute: match.traceroute || [],
    }));

    return {
      hosts,
      scanInfo: {},
      runStats: {},
    };
  } catch (error) {
    console.error('Error fetching ZoomEye data:', error);
    throw error;
  }
};

export const saveZoomEyeScanResult = async (orgId, userId, rootDomain, scanData) => {
  const scanResult = new ZoomEyeScanResult({
    org: orgId,
    user: userId,
    source: 'zoomeye',
    scanInfo: {
      type: 'zoomeye',
      protocol: scanData.protocol,
      numservices: scanData.numservices,
      services: scanData.services
    },
    runStats: scanData.runStats,
    additionalFields: scanData,
    createdAt: new Date()
  });

  await scanResult.save();

  const { ip, os, ports, status } = scanData;
  await Asset.updateOne(
    { domain: rootDomain, org: orgId },
    {
      $set: {
        ip,
        os,
        ports,
        status,
        sources: { zoomeye: new Date() },
        lastSeen: new Date()
      }
    },
    { upsert: true }
  );
};
