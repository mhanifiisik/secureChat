'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const cors_1 = __importDefault(require('cors'));
const express_1 = __importDefault(require('express'));
const http_1 = require('http');
const socket_io_1 = require('socket.io');
const swagger_ui_express_1 = __importDefault(require('swagger-ui-express'));
const prisma_1 = __importDefault(require('../prisma/prisma'));
const auth_1 = require('./routes/auth');
const swagger_1 = __importDefault(require('./swagger'));
const websocket_1 = require('./websocket');
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
  addTrailingSlash: false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
(0, websocket_1.socketHandlers)(io, prisma_1.default);
app.get('/', (req, res) => {
  res.send('API is running');
});
app.use('/api/auth', auth_1.authRoutes);
app.use('/swagger/api', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
