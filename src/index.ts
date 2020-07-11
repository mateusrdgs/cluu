import cluster from 'cluster'
import os from 'os'
import path from 'path'
import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import http from 'http'
import helmet from 'helmet'
import morgan from 'morgan'

import { startRedis } from './database/redis'
import { createSocket } from './socket'
import router from './router'

dotenv.config()

const PORT = process.env.PORT || 3000
const IS_PROD = process.env.NODE_ENV === 'prod'
const LOGGER_FORMAT = IS_PROD ? 'combined' : 'dev'
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = (process.env.REDIS_PORT as unknown) as number
const REDIS_PASSWORD = process.env.REDIS_password

const redis = startRedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
})

const socketWithRedis = createSocket(redis)

if (IS_PROD && cluster.isMaster) {
  const cpuCount = os.cpus().length
  for (let i = 0; i <= cpuCount; i++) {
    cluster.fork()
  }
} else {
  const app = express()
  const server = http.createServer(app)
  const socket = socketWithRedis(server)
  const routes = router.createRouter(socket)
  const logger = () => morgan(LOGGER_FORMAT)

  if (!IS_PROD) {
    app.use('/', express.static(path.resolve(__dirname, '../', 'public')))
  }

  app.use(helmet())
  app.use(logger())
  app.use(bodyParser.json())
  app.use('/api', routes)

  app.use((_: Request, res: Response) => {
    res.status(404).send('Not found')
  })

  server.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`)
  })
}
