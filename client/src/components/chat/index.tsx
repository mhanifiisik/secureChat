'use client';

import React, { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { ChatSideBar } from './sidebar';
import { ChatPanel } from './sidebar/chat-panel';
import { FriendList } from './sidebar/friend-list';
import { FriendRequests } from './sidebar/friend-list-request';

interface Friend {
  id: number;
  name: string;
}

export interface FriendRequest {
  id: number;
  sender: Friend;
  status?: 'pending' | 'accepted' | 'rejected';
}
export interface Message {
  messageId: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}
export const ChatSection = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  useEffect(() => {
    const newSocket = io('http://localhost:8000');

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('friends_list', ({ friends }: { friends: Friend[] }) => {
      setFriends(friends);
    });

    newSocket.on('friend_request_received', ({ friendship, sender }: { friendship: FriendRequest; sender: Friend }) => {
      setFriendRequests((prevRequests) => [...prevRequests, { ...friendship, sender }]);
    });

    newSocket.on(
      'friend_request_accepted',
      ({ friendship, receiverId }: { friendship: FriendRequest; receiverId: string }) => {
        setFriendRequests((prevRequests) => prevRequests.filter((request) => request.id !== friendship.id));
        setFriends((prevFriends) => [...prevFriends, friendship.sender]);
      },
    );

    newSocket.on('message_received', ({ message, senderId }: { message: Message; senderId: string }) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleAddFriend = (email: string) => {
    socket?.emit('send_friend_request', { email });
  };

  const handleAcceptFriendRequest = (friendshipId: string) => {
    socket?.emit('accept_friend_request', { friendshipId });
  };

  const handleSendMessage = (receiverId: string, content: string) => {
    socket?.emit('send_message', { receiverId, content });
  };

  return (
    <div className="flex min-h-screen w-full">
      <ChatSideBar onMenuClick={setActiveMenuItem} />

      {activeMenuItem === 'friends' && <FriendList friends={friends} onAddFriend={handleAddFriend} />}
      {activeMenuItem === 'friendRequests' && (
        <FriendRequests friendRequests={friendRequests} onAccept={handleAcceptFriendRequest} />
      )}
      {activeMenuItem === 'home' && <ChatPanel messages={messages} onSendMessage={handleSendMessage} />}
    </div>
  );
};

export default ChatSection;
