import React from 'react';

interface IMessageProps {
  type: 'receiver' | 'sender';
  content: string;
}

export const Message: React.FC<IMessageProps> = ({ type, content }) => {
  return (
    <div className={`message mb-4 flex items-start ${type === 'sender' ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col">
        <div
          className={`inline-block ${
            type === 'sender' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
          } rounded-full p-2 px-6`}
        >
          <span>{content}</span>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {/* <small>{type === "sender" ? "Me" : name}</small>,{" "} */}
          {/* <small>15 April</small> */}
        </div>
      </div>
    </div>
  );
};

export default Message;
