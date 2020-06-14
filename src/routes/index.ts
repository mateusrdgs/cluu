import express from 'express'
import health from './health'

const router = express.Router()

router.use('/health', health)

router.use('*', (_, res) => {
  res.status(404).send('Not found')
})

export default router
