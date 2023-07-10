import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';

import prisma from '../prisma/prisma';
import { authRoutes } from './routes/auth';
import swaggerSpecs from './swagger';
import { socketHandlers } from './websocket';

const { PORT } = process.env;
const app = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  addTrailingSlash: false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

socketHandlers(io, prisma);

app.use('/api/auth', authRoutes);
app.use('/swagger/api', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
