import express from 'express'
import createMatchControllers from '../controllers/match'

const createMatchRouting = (
  socketIOServer: SocketIO.Server
): express.Router => {
  const router = express.Router()
  const controller = createMatchControllers(socketIOServer)

  router.post('/start', controller.start)

  return router
}

export default createMatchRouting
