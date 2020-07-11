import util from 'util'
import redis from 'redis'

import Redis from '../utils/types/redis'

const startRedis = (options: redis.ClientOpts): Redis => {
  const client = redis.createClient(options)

  client.on('ready', () => {
    console.log('Redis connected')
  })
  client.on('error', (err) => {
    throw err
  })

  return {
    del: util.promisify(client.del).bind(client) as Redis['del'],
    hget: util.promisify(client.hget).bind(client) as Redis['hget'],
    hset: util.promisify(client.hset).bind(client) as Redis['hset'],
    sadd: util.promisify(client.sadd).bind(client) as Redis['sadd'],
    scard: util.promisify(client.sadd).bind(client) as Redis['scard'],
    smembers: util.promisify(client.smembers).bind(client) as Redis['smembers'],
  }
}

export { startRedis }
