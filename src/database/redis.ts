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
  del: util.promisify(client.del).bind(client) as del,
  hget: util.promisify(client.hget).bind(client) as hget,
  hset: util.promisify(client.hset).bind(client) as hset,
  sadd: util.promisify(client.sadd).bind(client) as sadd,
  scard: util.promisify(client.sadd).bind(client) as scard,
  smembers: util.promisify(client.smembers).bind(client) as smembers,
}

//#region types
type del = (...args: (string | redis.Callback<number>)[]) => Promise<number>

type hset = (
  key: string,
  field: string,
  value: string,
  cb?: redis.Callback<number>
) => Promise<number>

type hget = (
  key: string,
  field: string,
  cb?: redis.Callback<string> | undefined
) => Promise<string>

type sadd = (...args: (string | redis.Callback<number>)[]) => Promise<number>

type scard = (...args: (string | redis.Callback<number>)[]) => Promise<number>

type smembers = (
  key: string,
  cb?: redis.Callback<string[]> | undefined
) => Promise<string[]>

//#endregion
