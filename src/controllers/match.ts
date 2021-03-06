import express from 'express'

import Socket from '../utils/interfaces/socket'

const playersValidOptions = [4, 6, 8, 10]

interface PlayerControllers {
  start: (req: express.Request, res: express.Response) => void
}

const createMatchControllers = (socket: Socket): PlayerControllers => {
  const start = (req: express.Request, res: express.Response): void => {
    const max_players = req.body.max_players as string
    const maxPlayers = parseInt(max_players, 10)
    const isValidOption = playersValidOptions.some(
      (option) => option === maxPlayers
    )
    if (isValidOption) {
      socket.createNamespace(maxPlayers).then((path) => res.send({ path }))
    } else {
      res.status(400).send({ message: '' })
    }
  }

  return {
    start,
  }
}

export default createMatchControllers
