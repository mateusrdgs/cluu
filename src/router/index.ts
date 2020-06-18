import express from 'express'
import health from './health'
import createMatchRouting from './match'

const createRouter = (socketIOServer: SocketIO.Server): express.Router => {
  const router = express.Router()
  const match = createMatchRouting(socketIOServer)

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
