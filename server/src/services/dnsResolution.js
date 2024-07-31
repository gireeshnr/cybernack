import dns from 'dns';
import { promisify } from 'util';

const resolve = promisify(dns.resolve4);

export const resolveDomainToIP = async (domain) => {
  try {
    console.log(`Resolving domain to IP: ${domain}`);
    const addresses = await resolve(domain);
    const ip = addresses[0]; // Return the first IP address found
    console.log(`Resolved IP address for ${domain}: ${ip}`);
    return ip;
  } catch (error) {
    console.error(`Error resolving domain to IP: ${error.code} ${domain}`);
    throw new Error(`Failed to resolve domain to IP address for ${domain}: ${error.message}`);
  }
};
