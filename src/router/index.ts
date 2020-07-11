import express from 'express'
import health from './health'
import createMatchRouting from './match'

import Socket from '../utils/interfaces/socket'

const createRouter = (socket: Socket): express.Router => {
  const router = express.Router()
  const match = createMatchRouting(socket)

  router.use('/health', health)
  router.use('/match', match)

  router.use('*', (_, res) => {
    res.status(404).send('Not found')
  })

  return router
}

export default {
  createRouter,
}
