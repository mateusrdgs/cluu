import http from 'http'
import https from 'https'
import socketIO from 'socket.io'

import enums from '../enums'

const createServer = (server: http.Server | https.Server): socketIO.Server => {
  const io = socketIO(server, {
    serveClient: false,
  })

  return io
}

interface ICreateNamespace {
  socketIOServer: socketIO.Server
  path: string
}

const createNamespace = ({
  socketIOServer,
  path,
}: ICreateNamespace): socketIO.Namespace => {
  const namespace = socketIOServer.of(path)

  namespace.on(enums.events.connect, (socket: socketIO.Socket) => {
    const { username } = socket.handshake.query

    console.log(`${username} connected`)

    socket.on(enums.events.disconnect, () => {
      console.log(`${username} disconnected`)
    })
  })

  return namespace
}

export default {
  createServer,
  createNamespace,
}
