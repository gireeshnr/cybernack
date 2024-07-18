import dns from 'dns';
import { promisify } from 'util';

const resolve = promisify(dns.resolve4);

export const resolveDomainToIP = async (domain) => {
  try {
    const addresses = await resolve(domain);
    return addresses[0]; // Return the first IP address found
  } catch (error) {
    console.error('Error resolving domain to IP:', error.message);
    throw new Error('Failed to resolve domain to IP address');
  }
};
