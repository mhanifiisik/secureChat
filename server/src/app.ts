import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './swagger'
import authRoutes from './routes/auth'
import { socketHandlers } from './websocket'
import prisma from '../prisma/prisma'
import cors from 'cors'

const PORT = process.env.PORT
const app = express()
app.use(express.json())
app.use(cors())
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

socketHandlers(io, prisma)

app.use('/api/auth', authRoutes)
app.use('/swagger/api', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
