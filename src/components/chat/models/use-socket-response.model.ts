import type { Dispatch, SetStateAction } from 'react';
import type { Socket } from 'socket.io-client';

import type { FriendRequest } from './friend-request.model';
import type { Message } from './message.model';
import type { User } from './user.model';

export interface UseSocketResponse {
  socket: Socket | null;
  userId: string | null;
  messages: Message[];
  friendRequests: FriendRequest[];
  friends: User[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setFriendRequests: Dispatch<SetStateAction<FriendRequest[]>>;
  setFriends: Dispatch<SetStateAction<User[]>>;
  handleSendFriendRequest: (email: string) => void;
  handleAcceptFriendRequest: (friendShipId: string) => void;
  handleRejectFriendRequest: (friendShipId: string) => void;
  handleSendMessage: (receiverId: string, content: string) => void;
  handleGetMessages: (friendId: string) => void;
}
export default UseSocketResponse;
