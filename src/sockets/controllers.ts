import SocketIO from 'socket.io'

import redis from '../database/redis'
import enums from '../enums'

interface UserEvents {
  socket: SocketIO.Socket
  username: string
}

interface UserReady extends UserEvents {
  namespace: string
}

const throwErr = (err: Error) => {
  throw err
}

const checkCanStartGame = (namespace: string) => () => {
  return redis.smembers(namespace).then((members) => {
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

const getOnUserReady = ({
  socket,
  username,
  namespace,
}: UserReady) => (): void => {
  const broadcastUserReady = () =>
    socket.broadcast.emit(enums.events.user_ready, { username })

  redis
    .hset(socket.id, 'ready', 'true')
    .then(broadcastUserReady)
    .then(checkCanStartGame(namespace))
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

export default {
  getOnUserReady,
  getOnUserUnready,
  getOnUserDisconnect,
}
