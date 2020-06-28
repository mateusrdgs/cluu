import socketIO from 'socket.io'

import redis from '../database/redis'
import enums from '../enums'

interface UserEvents {
  socket: socketIO.Socket
  username: string
}

interface UserReady extends UserEvents {
  namespace: socketIO.Namespace
}

const getNamespaceName = (namespace: socketIO.Namespace): string =>
  namespace.name.replace('/', '')

const throwErr = (err: Error) => {
  throw err
}

const checkCanStartGame = (namespace: socketIO.Namespace) => () => {
  const namespaceName = getNamespaceName(namespace)

  return redis.smembers(namespaceName).then((members) => {
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

const onUserConnect = (namespace: socketIO.Namespace) => (
  socket: socketIO.Socket
): void => {
  const { username } = socket.handshake.query

  const onSetSocketId = () => {
    const onUserReady = getOnUserReady({ socket, username, namespace })
    const onUserUnready = getOnUserUnready({ socket, username })
    const onUserDisconnect = getOnUserDisconnect({ socket, username })

    socket.on(enums.events.ready, onUserReady)
    socket.on(enums.events.unready, onUserUnready)
    socket.on(enums.events.disconnect, onUserDisconnect)

    socket.broadcast.emit(enums.events.user_connect, { username })

    console.log(`${username} connected`)
  }

  const namespaceName = getNamespaceName(namespace)

  redis.sadd(namespaceName, socket.id).then(onSetSocketId).catch(throwErr)
}

export default {
  onUserConnect,
}
