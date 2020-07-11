import SocketIO from 'socket.io'

import enums from '../enums'
import controllersFactory from './controllers'
import Redis from '../utils/types/redis'

const throwErr = (err: Error) => {
  throw err
}

interface UserEvents {
  onUserConnect: (namespace: string) => (socket: SocketIO.Socket) => void
}

const eventsFactory = (namespace: string, redis: Redis): UserEvents => {
  const onUserConnect = () => (socket: SocketIO.Socket): void => {
    const { username } = socket.handshake.query

    const onSetSocketId = () => {
      const controllers = controllersFactory(namespace, username, socket, redis)

      socket.on(enums.events.ready, controllers.onUserReady)
      socket.on(enums.events.unready, controllers.onUserUnready)
      socket.on(enums.events.disconnect, controllers.onUserDisconnect)

      socket.broadcast.emit(enums.events.user_connect, { username })

      console.log(`${username} connected`)
    }

    redis.sadd(namespace, socket.id).then(onSetSocketId).catch(throwErr)
  }

  return {
    onUserConnect,
  }
}

export default eventsFactory
