import socketIO from 'socket.io'

import redis from '../database/redis'
import enums from '../enums'

const getOnUserReady = (socket: socketIO.Socket) => (): void => {
  redis.hget(socket.id, 'username', (err, username) => {
    if (err) {
      throw err
    } else {
      redis.hset(socket.id, 'ready', 'true', (err) => {
        if (err) {
          throw err
        } else {
          socket.broadcast.emit(enums.events.user_ready, { username })
        }
      })
    }
  })
}

const getOnUserUnready = (socket: socketIO.Socket) => (): void => {
  redis.hget(socket.id, 'username', (err, username) => {
    if (err) {
      throw err
    } else {
      redis.hset(socket.id, 'ready', 'false', (err) => {
        if (err) {
          throw err
        } else {
          socket.broadcast.emit(enums.events.user_unready, { username })
        }
      })
    }
  })
}

const getOnUserDisconnect = (socket: socketIO.Socket) => (): void => {
  redis.hget(socket.id, 'username', (err, username) => {
    if (err) {
      throw err
    } else {
      redis.del(socket.id, (err) => {
        if (err) {
          throw err
        } else {
          socket.broadcast.emit(enums.events.user_disconnect, { username })
          console.log(`${username} disconnected`)
        }
      })
    }
  })
}

const onUserConnect = (socket: socketIO.Socket): void => {
  const { username } = socket.handshake.query

  redis.hset(socket.id, 'username', username, (err) => {
    if (err) {
      throw err
    } else {
      const onUserReady = getOnUserReady(socket)
      const onUserUnready = getOnUserUnready(socket)
      const onUserDisconnect = getOnUserDisconnect(socket)

      socket.on(enums.events.ready, onUserReady)
      socket.on(enums.events.unready, onUserUnready)
      socket.on(enums.events.disconnect, onUserDisconnect)

      socket.broadcast.emit(enums.events.user_connect, { username })

      console.log(`${username} connected`)
    }
  })
}

export default {
  onUserConnect,
}
