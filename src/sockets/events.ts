import socketIO from 'socket.io'

import redis from '../database/redis'
import enums from '../enums'

interface UserEvents {
  socket: socketIO.Socket
  username: string
}

const throwErr = (err: Error) => {
  throw err
}

const getOnUserReady = ({ socket, username }: UserEvents) => (): void => {
  const broadcastUserReady = () =>
    socket.broadcast.emit(enums.events.user_ready, { username })

  redis
    .hset(socket.id, 'ready', 'true')
    .then(broadcastUserReady)
    .catch(throwErr)
}

const getOnUserUnready = ({ socket, username }: UserEvents) => (): void => {
  const broadcastUserUnready = () =>
    socket.broadcast.emit(enums.events.user_unready, { username })

  redis
    .hset(socket.id, 'ready', 'false')
    .then(broadcastUserUnready)
    .catch(throwErr)
}

const getOnUserDisconnect = ({ socket, username }: UserEvents) => (): void => {
  const broadcastUserDisconnected = () => {
    socket.broadcast.emit(enums.events.user_disconnect, { username })
    console.log(`${username} disconnected`)
  }

  redis.del(socket.id).then(broadcastUserDisconnected).catch(throwErr)
}

const onUserConnect = (socket: socketIO.Socket): void => {
  const { username } = socket.handshake.query

  const onSetUsername = () => {
    const onUserReady = getOnUserReady({ socket, username })
    const onUserUnready = getOnUserUnready({ socket, username })
    const onUserDisconnect = getOnUserDisconnect({ socket, username })

    socket.on(enums.events.ready, onUserReady)
    socket.on(enums.events.unready, onUserUnready)
    socket.on(enums.events.disconnect, onUserDisconnect)

    socket.broadcast.emit(enums.events.user_connect, { username })

    console.log(`${username} connected`)
  }

  redis
    .hset(socket.id, 'username', username)
    .then(onSetUsername)
    .catch(throwErr)
}

export default {
  onUserConnect,
}
