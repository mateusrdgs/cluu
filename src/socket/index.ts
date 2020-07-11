import http from 'http'
import https from 'https'
import SocketIO from 'socket.io'
import { v4 as uuid } from 'uuid'

import enums from '../enums'
import Redis from '../utils/types/redis'
import Socket from '../utils/interfaces/socket'

import eventsFactory from './events'
import middlewaresFactory from './middlewares'

const createSocket = (redis: Redis) => (
  server: http.Server | https.Server
): Socket => {
  const io = SocketIO(server, {
    serveClient: false,
  })

  const createNamespace = (maxPlayers: number): Promise<string> => {
    return new Promise((resolve) => {
      const path = uuid()
      const namespace = io.of(path)
      const resolveNamespacePath = () => resolve(path)

      const events = eventsFactory(namespace.name, redis)
      const middlewares = middlewaresFactory(namespace, redis)

      const onSetMaxPlayers = () => {
        namespace.use(middlewares.onConnection)
        namespace.on(enums.events.connect, events.onUserConnect)
      }

      redis
        .hset(namespace.name, 'max_players', maxPlayers.toString())
        .then(onSetMaxPlayers)
        .then(resolveNamespacePath)
    })
  }

  return {
    createNamespace,
  }
}

export { createSocket }
