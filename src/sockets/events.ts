import SocketIO from 'socket.io'

import redis from '../database/redis'
import enums from '../enums'
import controllers from './controllers'

const throwErr = (err: Error) => {
  throw err
}

const onUserConnect = (namespace: string) => (
  socket: SocketIO.Socket
): void => {
  const { username } = socket.handshake.query

  const onSetSocketId = () => {
    const onUserReady = controllers.getOnUserReady({
      socket,
      username,
      namespace,
    })
    const onUserUnready = controllers.getOnUserUnready({ socket, username })
    const onUserDisconnect = controllers.getOnUserDisconnect({
      socket,
      username,
    })

    socket.on(enums.events.ready, onUserReady)
    socket.on(enums.events.unready, onUserUnready)
    socket.on(enums.events.disconnect, onUserDisconnect)

    socket.broadcast.emit(enums.events.user_connect, { username })

    console.log(`${username} connected`)
  }

  redis.sadd(namespace, socket.id).then(onSetSocketId).catch(throwErr)
}

export default {
  onUserConnect,
}
