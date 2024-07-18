import Bull from 'bull';
import config from 'config';

const redisConfig = config.get('redisConfig');
const queue = new Bull('assetQueue', { redis: redisConfig });

export default queue;
