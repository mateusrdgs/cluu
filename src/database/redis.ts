import util from 'util'
import redis from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const config: redis.ClientOpts = {
  host: process.env.REDIS_HOST,
  port: (process.env.REDIS_PORT as unknown) as number,
  password: process.env.REDIS_password,
}

const client = redis.createClient(config)

client.on('ready', () => {
  console.log('Redis connected')
})

client.on('error', (err) => {
  throw err
})

export default {
  del: (util.promisify(client.del) as (
    args: string | string[]
  ) => Promise<number>).bind(client),
  hset: util.promisify(client.hset).bind(client),
}
