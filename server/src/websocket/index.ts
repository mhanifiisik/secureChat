import type { PrismaClient } from '@prisma/client';
import { FriendshipStatus, UserStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { Server, Socket } from 'socket.io';

import { decrypt, encrypt } from '../utils/encryption';

const secretKey = process.env.SECRET_KEY as string;

const userIdToSocketId: Record<string, string> = {};

export const socketHandlers = (io: Server, prisma: PrismaClient) => {
  const emitEventAndUpdateSocketId = async (socket: Socket, event: string, data: any, receiverId: string) => {
    try {
      const receiverSocketId = userIdToSocketId[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit(event, data);
      }
    } catch (error) {
      socket.emit('error', `Error emitting ${event}`);
    }
  };

  io.on('connection', async (socket: Socket) => {
    const { token } = socket.handshake.auth;
    let userId: string;
    console.log('User connected ::', socket.id);
    try {
      const decoded = jwt.verify(token, secretKey) as { userId: string };
      userId = decoded.userId;
      const user = await prisma.user.findUnique({ where: { userId } });

      if (!user) {
        socket.disconnect(true);
        return;
      }

      userIdToSocketId[userId] = socket.id;
      socket.emit('user_id', { userId });

      await prisma.user.update({
        where: { userId },
        data: { status: UserStatus.ONLINE },
      });
    } catch (error) {
      socket.disconnect(true);
      return;
    }

    socket.on('disconnect', async () => {
      try {
        await prisma.user.update({
          where: { userId },
          data: { status: UserStatus.OFFLINE },
        });

        delete userIdToSocketId[userId];
        console.log('User disconnected ::', socket.id);
      } catch (error) {
        socket.emit('error', 'Cant disconnect from the server');
      }
    });

    socket.on('reconnect', async () => {
      try {
        await prisma.user.update({
          where: { userId },
          data: { status: UserStatus.ONLINE },
        });

        userIdToSocketId[userId] = socket.id;
      } catch (error) {
        socket.emit('error', 'Cant reconnect the server');
      }
    });

    socket.on('send_friend_request', async ({ email }: { email: string }) => {
      try {
        const sender = await prisma.user.findUnique({ where: { userId } });
        const receiver = await prisma.user.findUnique({ where: { email } });

        if (!receiver) {
          socket.emit('error', 'Friend not found with the provided email');
          return;
        }

        const existingFriendship = await prisma.friendship.findFirst({
          where: {
            OR: [
              { senderId: sender?.userId, receiverId: receiver.userId },
              { senderId: receiver.userId, receiverId: sender?.userId },
            ],
          },
        });

        if (existingFriendship) {
          socket.emit('error', 'Friendship already requested');
          return;
        }

        const friendship = await prisma.friendship.create({
          data: {
            senderId: sender?.userId as string,
            receiverId: receiver.userId,
            status: FriendshipStatus.PENDING,
          },
        });

        await emitEventAndUpdateSocketId(
          socket,
          'friend_request_received',
          { ...friendship, ...sender },
          receiver.userId,
        );
      } catch (error) {
        socket.emit('error', 'Error sending friend request');
      }
    });

    socket.on('accept_friend_request', async (friendshipId: string) => {
      try {
        const friendship = await prisma.friendship.update({
          where: { friendshipId },
          data: { status: FriendshipStatus.ACCEPTED },
          include: { sender: true },
        });

        const receiverId = userId;
        const senderId = friendship.sender.userId;
        await emitEventAndUpdateSocketId(socket, 'friend_request_accepted', { friendship, receiverId }, senderId);
      } catch (error) {
        socket.emit('error', 'Error accepting friend request');
      }
    });

    socket.on('reject_friend_request', async (friendshipId: string) => {
      try {
        const friendship = await prisma.friendship.update({
          where: { friendshipId },
          data: { status: FriendshipStatus.REJECTED },
          include: { sender: true },
        });

        const receiverId = userId;
        const senderId = friendship.sender.userId;
        await emitEventAndUpdateSocketId(socket, 'friend_request_rejected', { friendship, receiverId }, senderId);
      } catch (error) {
        socket.emit('error', 'Error rejecting friend request');
      }
    });

    socket.on('send_message', async ({ receiverId, content }: { receiverId: string; content: string }) => {
      try {
        const encryptedContent = encrypt(content, secretKey);
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId,
            content: encryptedContent,
          },
        });

        await emitEventAndUpdateSocketId(
          socket,
          'message_received',
          { ...message, content: decrypt(message.content, secretKey) },
          receiverId,
        );
        socket.emit('message_received', decrypt(message.content, secretKey));
      } catch (error) {
        socket.emit('error', 'Error sending message');
      }
    });

    socket.on('get_friends', async () => {
      try {
        const friendships = await prisma.friendship.findMany({
          where: {
            OR: [
              { senderId: userId, status: FriendshipStatus.ACCEPTED },
              { receiverId: userId, status: FriendshipStatus.ACCEPTED },
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

        const friends = await prisma.user.findMany({
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
    });
    socket.on('get_messages', async (friendId: string) => {
      try {
        const messages = await prisma.message.findMany({
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
          return { ...message, content: decrypt(message.content, secretKey) };
        });
        socket.emit('messages', decryptedMessages);
      } catch (error) {
        socket.emit('error', 'Error fetching messages');
      }
    });
    socket.on('get_friend_requests', async () => {
      try {
        const user = await prisma.user.findUnique({ where: { userId } });

        if (!user) {
          socket.emit('error', 'User not found');
          return;
        }

        const friendRequests = await prisma.friendship.findMany({
          where: {
            receiverId: user.userId,
            status: FriendshipStatus.PENDING,
          },
          include: {
            sender: true,
          },
        });
        socket.emit('friend_requests', friendRequests);
      } catch (error) {
        socket.emit('error', 'Error fetching friend requests');
      }
    });
  });
};
