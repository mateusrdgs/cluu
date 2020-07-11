import redis from 'redis'

type Redis = {
  del: (...args: (string | redis.Callback<number>)[]) => Promise<number>
  hget: (
    key: string,
    field: string,
    cb?: redis.Callback<string> | undefined
  ) => Promise<string>
  hset: (
    key: string,
    field: string,
    value: string,
    cb?: redis.Callback<number>
  ) => Promise<number>
  sadd: (...args: (string | redis.Callback<number>)[]) => Promise<number>
  scard: (...args: (string | redis.Callback<number>)[]) => Promise<number>
  smembers: (
    key: string,
    cb?: redis.Callback<string[]> | undefined
  ) => Promise<string[]>
}

export default Redis
