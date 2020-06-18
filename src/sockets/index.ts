import http from 'http'
import https from 'https'
import socketIO from 'socket.io'

import enums from '../enums'
import events from './events'

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

  namespace.on(enums.events.connect, events.onUserConnect)

  return namespace
}

export default {
  createServer,
  createNamespace,
}
