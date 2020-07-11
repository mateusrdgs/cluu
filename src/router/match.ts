import express from 'express'
import createMatchControllers from '../controllers/match'

import Socket from '../utils/interfaces/socket'

const createMatchRouting = (socket: Socket): express.Router => {
  const router = express.Router()
  const controller = createMatchControllers(socket)

  router.post('/start', controller.start)

  return router
}

export default createMatchRouting
