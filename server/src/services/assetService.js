import Asset from '../models/Asset.js';
import Host from '../models/Host.js';
import ScanResult from '../models/NmapScanResult.js';
import ZoomEyeScanResult from '../models/ZoomEyeScanResult.js';

export const consolidateAssets = async () => {
  // Fetch all Nmap scan results
  const nmapScanResults = await ScanResult.find().populate('hosts');
  // Fetch all ZoomEye scan results
  const zoomEyeScanResults = await ZoomEyeScanResult.find();

  // Process Nmap scan results
  for (const scanResult of nmapScanResults) {
    const { org, hosts, createdAt } = scanResult;

    for (const host of hosts) {
      const { hostnames, address, addrtype, ports } = host;

      // Use the first hostname or address as the domain
      const domain = hostnames[0] || address;

      // Check if the asset already exists
      let asset = await Asset.findOne({ org: org, domain: domain });

      if (!asset) {
        asset = new Asset({
          org: org,
          domain: domain,
          type: addrtype,
          ip: address,
          ports: ports.map(port => ({
            protocol: port.protocol,
            portid: port.portid,
            state: port.state,
            service: port.service,
          })),
          sources: {
            nmap: {
              lastSeen: createdAt,
              data: scanResult,
            },
          },
          lastSeen: createdAt,
        });
      } else {
        // Update existing asset
        asset.ports = ports.map(port => ({
          protocol: port.protocol,
          portid: port.portid,
          state: port.state,
          service: port.service,
        }));
        asset.sources.set('nmap', {
          lastSeen: createdAt,
          data: scanResult,
        });
        asset.lastSeen = createdAt;
      }

      await asset.save();
    }
  }

  // Process ZoomEye scan results
  for (const scanResult of zoomEyeScanResults) {
    const { org, domain, ip, ports, createdAt } = scanResult;

    // Check if the asset already exists
    let asset = await Asset.findOne({ org: org, domain: domain });

    if (!asset) {
      asset = new Asset({
        org: org,
        domain: domain,
        type: 'IPv4',
        ip: ip,
        ports: ports.map(port => ({
          protocol: port.protocol,
          portid: port.portid,
          state: port.state,
          service: port.service,
        })),
        sources: {
          zoomeye: {
            lastSeen: createdAt,
            data: scanResult,
          },
        },
        lastSeen: createdAt,
      });
    } else {
      // Update existing asset
      asset.ports = [
        ...new Set([
          ...asset.ports,
          ...ports.map(port => ({
            protocol: port.protocol,
            portid: port.portid,
            state: port.state,
            service: port.service,
          }))
        ])
      ];
      asset.sources.set('zoomeye', {
        lastSeen: createdAt,
        data: scanResult,
      });
      asset.lastSeen = createdAt;
    }

    await asset.save();
  }
};
