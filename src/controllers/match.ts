import express from 'express'
import { v4 as uuid } from 'uuid'

import sockets from '../sockets'

interface PlayerControllers {
  start: (req: express.Request, res: express.Response) => void
}

const createMatchControllers = (
  socketIOServer: SocketIO.Server
): PlayerControllers => {
  const start = (_: express.Request, res: express.Response): void => {
    const path = uuid()

    sockets.createNamespace({ socketIOServer, path })

    res.send({ path })
  }

  return {
    start,
  }
}

export default createMatchControllers
