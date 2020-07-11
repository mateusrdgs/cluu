import SocketIO from 'socket.io'

import enums from '../enums'
import Redis from '../utils/types/redis'

interface UserControllers {
  onUserReady: () => void
  onUserUnready: () => void
  onUserDisconnect: () => void
}

const throwErr = (err: Error) => {
  throw err
}

const controllersFactory = (
  namespace: string,
  username: string,
  socket: SocketIO.Socket,
  redis: Redis
): UserControllers => {
  const onUserReady = () => {
    const checkCanStartGame = (namespace: string) => () => {
      return redis.smembers(namespace).then((members: string[]) => {
        const checkStatusIsTrue = (status: string) => status === 'true'

        const checkEveryPlayerIsReady = (playersStatus: boolean[]) =>
          playersStatus.every((status) => status === true)

        const membersStatus = members.map((member) =>
          redis.hget(member, 'ready').then(checkStatusIsTrue)
        )

        return Promise.all(membersStatus)
          .then(checkEveryPlayerIsReady)
          .then((isEveryPlayerReady) => {
            console.log(`Is every player ready? `, isEveryPlayerReady)
          })
      })
    }

    const broadcastUserReady = () =>
      socket.broadcast.emit(enums.events.user_ready, { username })

    redis
      .hset(socket.id, 'ready', 'true')
      .then(broadcastUserReady)
      .then(checkCanStartGame(namespace))
      .catch(throwErr)
  }

  const onUserUnready = () => {
    const broadcastUserUnready = () =>
      socket.broadcast.emit(enums.events.user_unready, { username })

    redis
      .hset(socket.id, 'ready', 'false')
      .then(broadcastUserUnready)
      .catch(throwErr)
  }

  const onUserDisconnect = () => {
    const broadcastUserDisconnected = () => {
      socket.broadcast.emit(enums.events.user_disconnect, { username })
      console.log(`${username} disconnected`)
    }

    redis.del(socket.id).then(broadcastUserDisconnected).catch(throwErr)
  }

  return {
    onUserReady,
    onUserUnready,
    onUserDisconnect,
  }
}

export default controllersFactory
