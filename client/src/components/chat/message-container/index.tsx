'use client';

import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { SocketContext } from '../../../utils/socket-provider';
import type { Message } from '../models/message.model';

export const MessageContainer: React.FC = () => {
  const { socket, messages, selectedFriend, messageRef, setMessages, scrollIntoView } = useContext(SocketContext);
  const [content, setContent] = useState<string>('');

  const handleSendMessage = () => {
    if (!socket || !selectedFriend) return;

    if (content.trim().length === 0) {
      toast.error('Message cannot be empty');
      return;
    }
    const newMessage: Message = {
      receiverId: selectedFriend.userId,
      content: content.trim(),
    };
    socket.emit('send_message', newMessage);
    setMessages?.((prev) => [...prev, newMessage]);
    scrollIntoView?.();
    setContent('');
  };

  return (
    <div>
      <div className="mb-2 flex h-[300px] flex-col gap-2 overflow-y-scroll rounded bg-gray-700 p-3" ref={messageRef}>
        {messages.map((message) => (
          <p
            key={message.messageId}
            className={`${message.senderId === selectedFriend?.userId ? 'text-left' : 'text-right'} text-white`}
          >
            {message.content}
          </p>
        ))}
      </div>

      <div className="flex rounded bg-gray-700 p-1">
        <input
          id="chat"
          className="mx-4 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="Your message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          type="submit"
          className="inline-flex cursor-pointer justify-center  rounded-full p-2 "
          onClick={handleSendMessage}
        >
          <PaperAirplaneIcon className="h-6 w-6 text-slate-300" />
        </button>
      </div>
    </div>
  );
};
