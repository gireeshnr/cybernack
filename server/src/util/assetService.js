// // server/src/util/assetService.js
// import { fetchShodanData } from '../services/shodanService.js';
// import Shodan from '../models/ShodanModel.js';
// import { mergeAsset } from './mergeAsset.js';
// import readline from 'readline';

// const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// const shouldRefresh = (lastSeen) => {
//   const now = Date.now();
//   const lastSeenTime = new Date(lastSeen).getTime();
//   const needsRefresh = !lastSeen || (now - lastSeenTime) > ONE_WEEK_MS;
//   console.log(`Current Time: ${new Date(now).toISOString()}`);
//   console.log(`Last Seen Time: ${lastSeen}`);
//   console.log(`Needs Refresh: ${needsRefresh}`);
//   return needsRefresh;
// };

// const askConfirmation = async (message) => {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

//   return new Promise((resolve) => {
//     rl.question(message, (answer) => {
//       rl.close();
//       resolve(answer.toLowerCase() === 'y');
//     });
//   });
// };

// export const collectAndSaveAssetData = async (domain, orgId) => {
//   console.log(`collectAndSaveAssetData called with domain: ${domain}, orgId: ${orgId}`);

//   let assetData = { domain, org: orgId, sources: {} };

//   // Fetch Shodan data
//   const shodanRecord = await Shodan.findOne({ domain, org: orgId });
//   const refreshShodan = shouldRefresh(shodanRecord?.lastSeen);
//   console.log(`Shodan refresh needed: ${refreshShodan}`);
//   if (refreshShodan) {
//     const confirmShodan = await askConfirmation('Proceed with fetching data from Shodan? (Y/N): ');
//     if (confirmShodan) {
//       console.log(`Fetching data from Shodan for domain: ${domain}`);
//       try {
//         const shodanData = await fetchShodanData(domain, orgId);
//         assetData.sources.shodan = { data: shodanData, lastSeen: new Date() };
//         await mergeAsset({ domain, org: orgId, data: shodanData, source: 'shodan' });
//       } catch (error) {
//         console.error('Error fetching Shodan data:', error.message);
//       }
//     } else if (shodanRecord) {
//       assetData.sources.shodan = shodanRecord;
//     }
//   } else if (shodanRecord) {
//     assetData.sources.shodan = shodanRecord;
//   }

//   console.log(`Data merged successfully for domain: ${domain}`);
//   return assetData;
// };
