'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.socketHandlers = void 0;
const client_1 = require('@prisma/client');
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const encryption_1 = require('../utils/encryption');
const secretKey = process.env.SECRET_KEY;
const userIdToSocketId = {};
const socketHandlers = (io, prisma) => {
  const emitEventAndUpdateSocketId = (socket, event, data, receiverId) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const receiverSocketId = userIdToSocketId[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit(event, data);
        }
      } catch (error) {
        socket.emit('error', `Error emitting ${event}`);
      }
    });
  io.on('connection', (socket) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const { token } = socket.handshake.auth;
      let userId;
      console.log('User connected ::', socket.id);
      try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        userId = decoded.userId;
        const user = yield prisma.user.findUnique({ where: { userId } });
        if (!user) {
          socket.disconnect(true);
          return;
        }
        userIdToSocketId[userId] = socket.id;
        socket.emit('user_id', { userId });
        yield prisma.user.update({
          where: { userId },
          data: { status: client_1.UserStatus.ONLINE },
        });
      } catch (error) {
        socket.disconnect(true);
        return;
      }
      socket.on('disconnect', () =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            yield prisma.user.update({
              where: { userId },
              data: { status: client_1.UserStatus.OFFLINE },
            });
            delete userIdToSocketId[userId];
            console.log('User disconnected ::', socket.id);
          } catch (error) {
            socket.emit('error', 'Cant disconnect from the server');
          }
        }),
      );
      socket.on('reconnect', () =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            yield prisma.user.update({
              where: { userId },
              data: { status: client_1.UserStatus.ONLINE },
            });
            userIdToSocketId[userId] = socket.id;
          } catch (error) {
            socket.emit('error', 'Cant reconnect the server');
          }
        }),
      );
      socket.on('send_friend_request', ({ email }) =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            const sender = yield prisma.user.findUnique({ where: { userId } });
            const receiver = yield prisma.user.findUnique({ where: { email } });
            if (!receiver) {
              socket.emit('error', 'Friend not found with the provided email');
              return;
            }
            const existingFriendship = yield prisma.friendship.findFirst({
              where: {
                OR: [
                  {
                    senderId: sender === null || sender === void 0 ? void 0 : sender.userId,
                    receiverId: receiver.userId,
                  },
                  {
                    senderId: receiver.userId,
                    receiverId: sender === null || sender === void 0 ? void 0 : sender.userId,
                  },
                ],
              },
            });
            if (existingFriendship) {
              socket.emit('error', 'Friendship already requested');
              return;
            }
            const friendship = yield prisma.friendship.create({
              data: {
                senderId: sender === null || sender === void 0 ? void 0 : sender.userId,
                receiverId: receiver.userId,
                status: client_1.FriendshipStatus.PENDING,
              },
            });
            yield emitEventAndUpdateSocketId(
              socket,
              'friend_request_received',
              Object.assign(Object.assign({}, friendship), sender),
              receiver.userId,
            );
          } catch (error) {
            socket.emit('error', 'Error sending friend request');
          }
        }),
      );
      socket.on('accept_friend_request', (friendshipId) =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            const friendship = yield prisma.friendship.update({
              where: { friendshipId },
              data: { status: client_1.FriendshipStatus.ACCEPTED },
              include: { sender: true },
            });
            const receiverId = userId;
            const senderId = friendship.sender.userId;
            yield emitEventAndUpdateSocketId(socket, 'friend_request_accepted', { friendship, receiverId }, senderId);
          } catch (error) {
            socket.emit('error', 'Error accepting friend request');
          }
        }),
      );
      socket.on('reject_friend_request', (friendshipId) =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            const friendship = yield prisma.friendship.update({
              where: { friendshipId },
              data: { status: client_1.FriendshipStatus.REJECTED },
              include: { sender: true },
            });
            const receiverId = userId;
            const senderId = friendship.sender.userId;
            yield emitEventAndUpdateSocketId(socket, 'friend_request_rejected', { friendship, receiverId }, senderId);
          } catch (error) {
            socket.emit('error', 'Error rejecting friend request');
          }
        }),
      );
      socket.on('send_message', ({ receiverId, content }) =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            const encryptedContent = (0, encryption_1.encrypt)(content, secretKey);
            const message = yield prisma.message.create({
              data: {
                senderId: userId,
                receiverId,
                content: encryptedContent,
              },
            });
            yield emitEventAndUpdateSocketId(
              socket,
              'message_received',
              Object.assign(Object.assign({}, message), {
                content: (0, encryption_1.decrypt)(message.content, secretKey),
              }),
              receiverId,
            );
            socket.emit('message_received', (0, encryption_1.decrypt)(message.content, secretKey));
          } catch (error) {
            socket.emit('error', 'Error sending message');
          }
        }),
      );
      socket.on('get_friends', () =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            const friendships = yield prisma.friendship.findMany({
              where: {
                OR: [
                  { senderId: userId, status: client_1.FriendshipStatus.ACCEPTED },
                  { receiverId: userId, status: client_1.FriendshipStatus.ACCEPTED },
                ],
              },
              include: {
                sender: true,
                receiver: true,
              },
            });
            const friendIds = friendships.flatMap((friendship) => {
              if (friendship.sender.userId === userId) {
                return friendship.receiverId;
              }
              return friendship.senderId;
            });
            const friends = yield prisma.user.findMany({
              where: {
                userId: { in: friendIds },
              },
              include: {
                receivedMessages: true,
                sentMessages: true,
              },
            });
            socket.emit('friends', friends);
          } catch (error) {
            socket.emit('error', 'Error fetching friends');
          }
        }),
      );
      socket.on('get_messages', (friendId) =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            const messages = yield prisma.message.findMany({
              where: {
                OR: [
                  { senderId: userId, receiverId: friendId },
                  { senderId: friendId, receiverId: userId },
                ],
              },
              orderBy: {
                createdAt: 'asc',
              },
            });
            const decryptedMessages = messages.map((message) => {
              return Object.assign(Object.assign({}, message), {
                content: (0, encryption_1.decrypt)(message.content, secretKey),
              });
            });
            socket.emit('messages', decryptedMessages);
          } catch (error) {
            socket.emit('error', 'Error fetching messages');
          }
        }),
      );
      socket.on('get_friend_requests', () =>
        __awaiter(void 0, void 0, void 0, function* () {
          try {
            const user = yield prisma.user.findUnique({ where: { userId } });
            if (!user) {
              socket.emit('error', 'User not found');
              return;
            }
            const friendRequests = yield prisma.friendship.findMany({
              where: {
                receiverId: user.userId,
                status: client_1.FriendshipStatus.PENDING,
              },
              include: {
                sender: true,
              },
            });
            socket.emit('friend_requests', friendRequests);
          } catch (error) {
            socket.emit('error', 'Error fetching friend requests');
          }
        }),
      );
    }),
  );
};
exports.socketHandlers = socketHandlers;
