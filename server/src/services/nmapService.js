import { exec } from 'child_process';
import util from 'util';
import xml2js from 'xml2js';
import NmapScanResult from '../models/NmapScanResult.js';
import Asset from '../models/Asset.js';

const execAsync = util.promisify(exec);

const parseNmapXML = (xml) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const scanInfo = JSON.stringify(result.nmaprun.scaninfo[0].$);
        const runStats = {
          finished: new Date(parseInt(result.nmaprun.runstats[0].finished[0].$.time, 10) * 1000),
          hosts: result.nmaprun.runstats[0].hosts[0].$
        };

        const hosts = result.nmaprun.host.map(host => {
          const ports = host.ports[0].port.map(port => ({
            protocol: port.$.protocol,
            portid: parseInt(port.$.portid, 10),
            state: port.state[0].$.state,
            reason: port.state[0].$.reason,
            reason_ttl: parseInt(port.state[0].$.reason_ttl, 10),
            service: port.service ? port.service[0].$.name : null,
            product: port.service ? port.service[0].$.product : null,
            extra_info: port.service ? port.service[0].$.extrainfo : null,
            method: port.service ? port.service[0].$.method : null,
            confidence: port.service ? parseInt(port.service[0].$.conf, 10) : null,
          }));

          let os = '';
          if (host.os && host.os[0] && host.os[0].osmatch) {
            os = host.os[0].osmatch[0].$.name;
          }

          const hostnames = host.hostnames ? host.hostnames[0].hostname.map(h => h.$.name) : [];
          const times = host.times ? {
            srtt: parseInt(host.times[0].$.srtt, 10),
            rttvar: parseInt(host.times[0].$.rttvar, 10),
            to: parseInt(host.times[0].$.to, 10),
          } : null;

          const tcpSequence = host.tcpsequence ? host.tcpsequence[0].$.values : null;
          const ipIdSequence = host.ipidsequence ? host.ipidsequence[0].$.values : null;
          const tcpTimestampSeq = host.tcptssequence ? host.tcptssequence[0].$.values : null;
          const distance = host.distance ? parseInt(host.distance[0].$.value, 10) : null;

          const traceroute = host.trace ? host.trace[0].hop.map(hop => ({
            ttl: parseInt(hop.$.ttl, 10),
            ipaddr: hop.$.ipaddr,
            rtt: parseFloat(hop.$.rtt),
            host: hop.$.host,
          })) : [];

          return {
            state: host.status[0].$.state,
            reason: host.status[0].$.reason,
            reason_ttl: parseInt(host.status[0].$.reason_ttl, 10),
            address: host.address[0].$.addr,
            addrtype: host.address[0].$.addrtype,
            hostnames,
            ports,
            os,
            starttime: parseInt(host.$.starttime, 10),
            endtime: parseInt(host.$.endtime, 10),
            times,
            tcpSequence,
            ipIdSequence,
            tcpTimestampSeq,
            distance,
            traceroute
          };
        });

        resolve({ hosts, scanInfo, runStats });
      }
    });
  });
};

const runNmapScan = async (target) => {
  const { stdout, stderr } = await execAsync(`nmap -sS -sV -sC -O -A -p- -oX - ${target}`);
  if (stderr) {
    throw new Error(`Nmap scan failed: ${stderr}`);
  }
  return stdout;
};

export const runNmapDiscovery = async (rootDomain, user) => {
  try {
    const nmapResults = await runNmapScan(rootDomain);
    const { hosts, scanInfo, runStats } = await parseNmapXML(nmapResults);

    const scanResult = await NmapScanResult.findOneAndUpdate(
      { org: user.org._id, target: rootDomain, source: 'nmap' },
      {
        org: user.org._id,
        user: user._id,
        source: 'nmap',
        target: rootDomain,
        scanInfo,
        runStats,
        additionalFields: { rawXML: nmapResults },
      },
      { new: true, upsert: true, strict: false }
    );

    for (const host of hosts) {
      const existingAsset = await Asset.findOne({ org: user.org._id, domain: rootDomain });

      if (existingAsset) {
        existingAsset.ip = host.address;
        existingAsset.ports = host.ports;
        existingAsset.lastSeen = new Date();
        existingAsset.status = host.state;
        existingAsset.os = host.os;
        existingAsset.hostnames = host.hostnames;
        existingAsset.uptime = host.times ? host.times.srtt : null;
        existingAsset.tcpSequence = host.tcpSequence;
        existingAsset.ipIdSequence = host.ipIdSequence;
        existingAsset.tcpTimestampSeq = host.tcpTimestampSeq;
        existingAsset.srtt = host.times ? host.times.srtt : null;
        existingAsset.rttVariance = host.times ? host.times.rttvar : null;
        existingAsset.timeout = host.times ? host.times.to : null;
        existingAsset.distance = host.distance;
        existingAsset.traceroute = host.traceroute;
        existingAsset.sources.set('nmap', new Date());
        await existingAsset.save();
      } else {
        const newAsset = new Asset({
          domain: rootDomain,
          type: 'host',
          org: user.org._id,
          ip: host.address,
          identifier: `${host.address}-${host.starttime}`, // Ensure identifier is unique
          ports: host.ports,
          status: host.state,
          os: host.os,
          hostnames: host.hostnames,
          uptime: host.times ? host.times.srtt : null,
          tcpSequence: host.tcpSequence,
          ipIdSequence: host.ipIdSequence,
          tcpTimestampSeq: host.tcpTimestampSeq,
          srtt: host.times ? host.times.srtt : null,
          rttVariance: host.times ? host.times.rttvar : null,
          timeout: host.times ? host.times.to : null,
          distance: host.distance,
          traceroute: host.traceroute,
          sources: new Map([['nmap', new Date()]]),
        });
        await newAsset.save();
      }
    }

    return { message: 'NMAP scan completed and results saved.' };
  } catch (error) {
    console.error('Error during NMAP scan:', error);
    throw new Error(error.message);
  }
};

