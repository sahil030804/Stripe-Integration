const { createClient } = require('redis');
const config = require('../config/config');

class Redis {
  constructor() {
    this.redisClient = null;
  }

  async createClient() {
    this.redisClient = createClient({
      // username: config.redis.REDIS_USERNAME,
      // password: config.redis.REDIS_PASSWORD,
      socket: {
        host: config.redis.REDIS_HOST,
        port: config.redis.REDIS_PORT,
      },
    });

    this.redisClient.on('error', (err) =>
      console.log('Redis Client Error', err)
    );
    this.redisClient.on('connect', () => console.log('Redis Server Connected'));

    await this.redisClient.connect();
    return this.redisClient;
  }

  async getClient() {
    if (!this.redisClient) {
      return await this.createClient();
    }
    return this.redisClient;
  }
}

module.exports = new Redis();
