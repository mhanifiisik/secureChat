'use client';
import Dropdown from '@/components/dropdown';
import {
  PaperAirplaneIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';

interface Friendship {
  createdAt: string;
  friendshipId: string;
  receiverId: string;
  senderId: string;
  status: string;
  updatedAt: string;
}

interface User {
  createdAt: string;
  email: string;
  name: string;
  status: string;
  updatedAt: string;
  userId: string;
  messages: Message[];
}

interface FriendRequest {
  friendship: Friendship;
  sender: User;
}

interface Message {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
}

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [email, setEmail] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [isAddFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const [isFriendsDropdownOpen, setFriendsDropdownOpen] = useState<boolean>(false);
  const [isFriendRequestsDropdownOpen, setFriendRequestsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const token = Cookies.get('token');
    const newSocket = io('http://localhost:8000', { auth: { token } });

    newSocket.on('connect', () => {
      console.log('Connected to the server');
    });

    newSocket.on('friend_request_received', (friendship: FriendRequest) => {
      setFriendRequests((requests) => [...requests, friendship]);
      toast.success('Friend request received!');
    });

    newSocket.on('friend_request_accepted', (request) => {
      const { friendship, sender } = request;
      setFriendRequests((prev) => prev.filter((req) => req.friendship.friendshipId !== friendship.friendshipId));
      setFriends((prev) => [...prev, sender]);
      toast.success('Friend request accepted!');
    });
    newSocket.on('user_id', ({ id }: { id: string }) => {
      setUserId(id);
    });

    newSocket.on('friends', (friendList: User[]) => {
      setFriends(friendList);
    });

    newSocket.on('message_received', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      toast.info('New message received!');
    });

    newSocket.on('messages', (message: Message[]) => {
      setMessages(message);
    });

    newSocket.on('error', (newErr) => {
      toast.error(`Error: ${newErr}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
      newSocket.off('connect');
      newSocket.off('friend_request_received');
      newSocket.off('friend_request_accepted');
      newSocket.off('friends');
      newSocket.off('message_received');
      newSocket.off('error');
    };
  }, []);

  const handleSendFriendRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (socket) {
      socket.emit('send_friend_request', { email });
      setEmail('');
      setAddFriendModalOpen(false);
      toast.success('Friend request has been sent successfully');
    }
  };

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (socket && selectedFriend) {
      const message = {
        messageId: Date.now().toString(),
        senderId: userId as string,
        receiverId: selectedFriend.userId,
        content,
      };
      socket.emit('send_message', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setContent('');
    }
  };

  const handleAcceptFriendRequest = (friendShipId: string) => {
    if (socket) {
      socket.emit('accept_friend_request', { friendshipId: friendShipId });
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request.friendship.friendshipId !== friendShipId),
      );
    }
  };

  const handleRejectFriendRequest = (friendShipId: string) => {
    if (socket) {
      socket.emit('reject_friend_request', { friendshipId: friendShipId });
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request.friendship.friendshipId !== friendShipId),
      );
    }
  };

  const closeModal = () => {
    setAddFriendModalOpen(false);
  };

  const handleToggleFriendsDropdown = () => {
    setFriendsDropdownOpen((prev) => !prev);
    socket?.emit('get_friends');
  };
  const handleToggleFriendRequestDropdown = () => {
    setFriendRequestsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen min-w-full grid place-items-center bg-slate-900 text-white">
      <div className="">
        <div className="flex justify-end">
          <button
            type="button"
            className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={() => setAddFriendModalOpen(true)}
          >
            Add Friend
          </button>
          <Dropdown
            open={isFriendsDropdownOpen}
            buttonText="Friends"
            dropdownMenuContent={
              <>
                {friends.map((friend, idx) => (
                  <div
                    onClick={() => {
                      setSelectedFriend(friend);
                      socket?.emit('get_messages', friend.userId);
                      setFriendsDropdownOpen(false);
                    }}
                    key={idx}
                    className="flex items-center w-full overflow-hidden justify-between gap-3 px-4 py-2 cursor-pointer hover:bg-slate-500 hover:rounded-sm"
                  >
                    <p className="text-ellipsis">
                      {friend.name.length > 10 ? `${friend.name.slice(0, 10)}...` : friend.name}
                    </p>
                    <span
                      className={`rounded-full w-2 h-2 ${friend.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-600'}`}
                    ></span>
                  </div>
                ))}
              </>
            }
            handleToggleDropDown={handleToggleFriendsDropdown}
            handleCloseDropDown={() => setFriendsDropdownOpen(false)}
          />

          <Dropdown
            open={isFriendRequestsDropdownOpen}
            buttonText="Friend Requests"
            dropdownMenuContent={
              <>
                {friendRequests.map((friendRequest, idx) => (
                  <div
                    onClick={() => setFriendRequestsDropdownOpen(false)}
                    key={idx}
                    className="flex items-center w-full overflow-hidden justify-between gap-3 px-4 py-2 cursor-pointer hover:bg-slate-500 hover:rounded-sm"
                  >
                    {friendRequest.sender.email}
                    <CheckCircleIcon
                      className="w-4 h-4 text-green-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptFriendRequest(friendRequest.friendship.friendshipId);
                      }}
                    />
                    <XCircleIcon
                      className="w-4 h-4 text-red-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectFriendRequest(friendRequest.friendship.friendshipId);
                      }}
                    />
                  </div>
                ))}
              </>
            }
            handleCloseDropDown={() => setFriendRequestsDropdownOpen(false)}
            handleToggleDropDown={handleToggleFriendRequestDropdown}
          />
        </div>
        <div className="mt-1">
          <div className="messageContainer h-[300px] bg-gray-700 mb-2 rounded gap-2 p-3 flex flex-col overflow-y-scroll">
            {messages.map((message) => (
              <p
                key={message.messageId}
                className={`${message.senderId === selectedFriend?.userId ? 'text-left' : 'text-right'} text-white`}
              >
                {message.content}
              </p>
            ))}
          </div>

          <div className="flex bg-gray-700 p-1 rounded">
            <input
              id="chat"
              className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              type="submit"
              className="inline-flex justify-center p-2  rounded-full cursor-pointer "
              onClick={handleSendMessage}
            >
              <PaperAirplaneIcon className="w-6 h-6 text-slate-300" />
            </button>
          </div>
        </div>
      </div>
      {isAddFriendModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0  opacity-70"></div>
          <div className="relative z-10 w-[250px] h-[250px] bg-gray-700 border border-slate-300 text-white rounded-lg shadow">
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={closeModal}
            >
              <XMarkIcon className="w-5 h-5" />
              <span className="sr-only">Close modal</span>
            </button>
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-xl font-medium text-white">Add Friend</h3>
              <form className="space-y-6" onSubmit={handleSendFriendRequest}>
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="john@doe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Send Friend Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
