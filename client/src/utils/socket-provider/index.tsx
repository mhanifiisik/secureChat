'use client';

import Cookies from 'js-cookie';
import type { Dispatch } from 'react';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import type { FriendRequest } from '../../components/chat/models/friend-request.model';
import type { Message } from '../../components/chat/models/message.model';
import type { User } from '../../components/chat/models/user.model';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  selectedFriend: User | null;
  messages: Message[];
  friends: User[];
  friendRequests: FriendRequest[];
  messageRef: React.RefObject<HTMLDivElement> | null;
  scrollIntoView?: () => void;
  setSelectedFriend?: Dispatch<React.SetStateAction<User | null>>;
  setMessages?: Dispatch<React.SetStateAction<Message[]>>;
}

const socketInitialValues: SocketContextProps = {
  socket: null,
  isConnected: false,
  selectedFriend: null,
  setSelectedFriend: undefined,
  setMessages: undefined,
  messages: [],
  friends: [],
  friendRequests: [],
  messageRef: null,
  scrollIntoView: undefined,
};

export const SocketContext = createContext(socketInitialValues);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const messageRef = useRef<HTMLDivElement | null>(null);

  const scrollIntoView = useCallback(() => {
    messageRef.current?.scrollTo(0, messageRef.current.scrollHeight);
  }, []);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return;

    const newSocket = io(`${process.env.WS_URL}`, { auth: { token }, addTrailingSlash: false });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('friend_request_received', (data: FriendRequest) => {
      setFriendRequests((requests) => [...requests, data]);
      toast.success('Friend request received!');
    });

    newSocket.on('friend_request_accepted', (data: FriendRequest) => {
      setFriendRequests((prev) => prev.filter((req) => req.friendshipId !== data.friendshipId));
      toast.success('Friend request accepted!');
    });

    newSocket.on('friend_request_rejected', (data: FriendRequest) => {
      setFriendRequests((prev) => prev.filter((req) => req.friendshipId !== data.friendshipId));
      toast.info('Friend request rejected!');
    });

    newSocket.on('friend_requests', (data: FriendRequest[]) => {
      setFriendRequests(data);
    });
    newSocket.on('friends', (data: User[]) => {
      setFriends(data);
    });
    newSocket.on('messages', (newMessages: Message[]) => {
      setMessages(newMessages);
    });
    newSocket.on('message_received', (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
      scrollIntoView();
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('error', (newErr: string) => {
      toast.error(`Error: ${newErr}`);
    });

    setSocket(newSocket);

    // eslint-disable-next-line consistent-return
    return () => {
      newSocket.close();
    };
  }, [scrollIntoView]);

  const values = useMemo(
    () => ({
      socket,
      friends,
      messages,
      isConnected,
      selectedFriend,
      friendRequests,
      messageRef,
      scrollIntoView,
      setMessages,
      setSelectedFriend,
    }),
    [
      socket,
      isConnected,
      selectedFriend,
      messages,
      friends,
      friendRequests,
      messageRef,
      setSelectedFriend,
      setMessages,
      scrollIntoView,
    ],
  );

  return <SocketContext.Provider value={values}>{children}</SocketContext.Provider>;
}
