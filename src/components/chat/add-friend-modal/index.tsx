'use client';

import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';
import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { SocketContext } from '../../../utils/socket-provider';

export const AddFriend: FC = () => {
  const { socket } = useContext(SocketContext);

  const [open, setOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const closeModal = () => {
    setOpen(false);
  };

  const handleSendFriendRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (socket) {
      socket.emit('send_friend_request', { email });
      setEmail('');
      closeModal();
      toast.success('Friend request has been sent successfully');
    }
  };

  return (
    <div>
      <button
        type="button"
        className="mb-2 mr-2 flex flex-row items-center justify-between gap-2 rounded-lg border border-gray-600 bg-gray-800 px-5  py-2.5 text-sm  font-medium text-gray-400  duration-300 hover:bg-gray-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-700"
        onClick={() => setOpen(true)}
      >
        <UserPlusIcon className="h-5 w-5 md:mr-1" />
        Add
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
            <div className="p-6 lg:px-8">
              <h3 className="mb-4 text-xl font-medium text-white">Add Friend</h3>
              <form className="space-y-6" onSubmit={handleSendFriendRequest}>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="john@doe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="mb-2 mr-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
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
};
