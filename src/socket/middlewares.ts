import SocketIO from 'socket.io'

import Redis from '../utils/types/redis'

interface UserMiddlewares {
  onConnection: () => void
}

const parseToInteger = (s: string) => parseInt(s, 10)

const middlewaresFactory = (
  namespace: SocketIO.Namespace,
  redis: Redis
): UserMiddlewares => {
  const onConnection = () => (
    socket: SocketIO.Socket,
    next: (err?: unknown) => void
  ): void => {
    redis
      .hget(namespace.name, 'max_players')
      .then(parseToInteger)
      .then((maxPlayers: number) => {
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

  return {
    onConnection,
  }
}

export default middlewaresFactory
