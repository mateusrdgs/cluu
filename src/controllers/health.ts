import { Request, Response } from 'express'

const health = (_: Request, res: Response): void => {
  res.send(`${process.uptime()}`)
}

export default {
  health,
}
