'use client';

import { UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';
import React, { useContext, useState } from 'react';

import { SocketContext } from '../../../utils/socket-provider';
import type { User } from '../models/user.model';

export const Friends: FC = () => {
  const { socket, friends, setSelectedFriend, scrollIntoView } = useContext(SocketContext);
  const [open, setOpen] = useState<boolean>(false);

  const closeModal = () => {
    setOpen(false);
  };
  const handleToggleDropdown = () => {
    socket?.emit('get_friends');
    setOpen(true);
  };
  const handleSelectFriend = (friend: User) => {
    setSelectedFriend?.(friend);
    socket?.emit('get_messages', friend.userId);
    scrollIntoView?.();
    closeModal();
  };

  return (
    <div className="relative flex flex-col items-center rounded-lg">
      <button
        onClick={handleToggleDropdown}
        className="mb-2 mr-2 flex flex-row items-center justify-between gap-2 rounded-lg border border-gray-600 bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-400 duration-300 hover:bg-gray-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-700"
      >
        <UserGroupIcon className="h-5 w-5 md:mr-1" /> Friends
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 opacity-70"></div>
          <div className="relative z-10 w-[250px] max-w-full rounded-lg   bg-slate-800 text-white shadow">
            <button
              type="button"
              className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={closeModal}
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="sr-only">Close modal</span>
            </button>
            <div className="max-h-[250px] overflow-y-auto p-6 lg:px-8">
              <h3 className="mb-4 text-xl font-medium text-white">Friends</h3>
              <div className="flex flex-col gap-2">
                {friends.map((friend: User) => (
                  <p
                    className="cursor-pointer text-gray-300 hover:text-white"
                    onClick={() => handleSelectFriend(friend)}
                    key={friend.userId}
                  >
                    {friend.email}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
