'use client';

import { useState } from 'react';

import type { Message as MessageType } from '@/hook/useSocket';

import Message from '../../message';

interface ChatPanelProps {
  messages: MessageType[];
  onSendMessage: (receiverId: string, content: string) => void;
}
export const ChatPanel = ({ onSendMessage, messages }: ChatPanelProps) => {
  const [text, setText] = useState<string>('');
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() !== '') {
      onSendMessage('receiverId', text);
      setText('');
    }
  };
  return (
    <main className="h-full flex-1 overflow-hidden">
      <div className="chat-area flex flex-col p-6 ">
        <div className="messages max-h-[600px] overflow-y-auto">
          {messages.map((message) => (
            <Message key={message.messageId} type={'receiver'} content={message.content} />
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 flex flex-1 items-center p-8">
        <textarea
          id="chat"
          rows={1}
          className="mx-4 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="Your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <button
          onClick={handleSendMessage}
          className="inline-flex cursor-pointer justify-center rounded-full p-2 text-white hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6 rotate-90"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          ></svg>
          <span className="sr-only">Send message</span>
        </button>
      </div>
    </main>
  );
};
