import http from 'http'
import https from 'https'
import SocketIO from 'socket.io'
import { v4 as uuid } from 'uuid'

import redis from '../database/redis'
import enums from '../enums'
import events from './events'

const parseToInteger = (s: string) => parseInt(s, 10)

const createServer = (server: http.Server | https.Server): SocketIO.Server => {
  const io = SocketIO(server, {
    serveClient: false,
  })

  return io
}

const onConnection = (namespace: SocketIO.Namespace) => (
  socket: SocketIO.Socket,
  next: (err?: unknown) => void
): void => {
  redis
    .hget(namespace.name, 'max_players')
    .then(parseToInteger)
    .then((maxPlayers) => {
      namespace.clients((err: Error, clients: string[]) => {
        if (err) {
          throw err
        } else {
          if (clients.length >= maxPlayers) {
            socket.disconnect(true)
          } else {
            next()
          }
        }
      })
    })
}

interface CreateNamespace {
  socketIOServer: SocketIO.Server
  maxPlayers: number
}

const createNamespace = ({
  socketIOServer,
  maxPlayers,
}: CreateNamespace): Promise<string> => {
  return new Promise((resolve) => {
    const path = uuid()
    const namespace = socketIOServer.of(path)

    const onSetMaxPlayers = () => {
      namespace.use(onConnection(namespace))
      namespace.on(enums.events.connect, events.onUserConnect(namespace.name))
    }

    const resolveNamespacePath = () => resolve(path)

    redis
      .hset(namespace.name, 'max_players', maxPlayers.toString())
      .then(onSetMaxPlayers)
      .then(resolveNamespacePath)
  })
}

export default {
  createServer,
  createNamespace,
}
