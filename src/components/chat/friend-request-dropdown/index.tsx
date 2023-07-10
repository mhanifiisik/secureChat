'use client';

import { CheckCircleIcon, InboxArrowDownIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { type FC, useContext, useState } from 'react';

import { SocketContext } from '../../../utils/socket-provider';
import type { FriendRequest as FriendRequestType } from '../models/friend-request.model';

export const FriendRequest: FC = () => {
  const { socket, friendRequests } = useContext(SocketContext);
  const [open, setOpen] = useState<boolean>(false);

  const closeModal = () => {
    setOpen(false);
  };
  const handleToggleDropdown = () => {
    socket?.emit('get_friend_requests');
    setOpen(true);
  };
  const handleAcceptRequest = (friendShipId: string) => {
    socket?.emit('accept_friend_request', friendShipId);
    closeModal();
  };
  const handleRejectRequest = (friendShipId: string) => {
    socket?.emit('reject_friend_request', friendShipId);
    closeModal();
  };

  return (
    <div className="relative flex flex-col items-center rounded-lg">
      <button
        onClick={handleToggleDropdown}
        className="mb-2 mr-2 flex flex-row items-center justify-between gap-2 rounded-lg border border-gray-600 bg-gray-800 px-5  py-2.5 text-sm  font-medium text-gray-400  duration-300 hover:bg-gray-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-700"
      >
        <InboxArrowDownIcon className="h-5 w-5 md:mr-1" /> Requests
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 opacity-70"></div>
          <div className="relative z-10  max-w-full rounded-lg  bg-slate-800 text-white shadow">
            <button
              type="button"
              className="absolute  right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={closeModal}
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="sr-only">Close modal</span>
            </button>
            <div className="w-full p-6 md:p-8">
              <h3 className="mb-4 text-xl font-medium text-white">Friend Requests</h3>
              <div className="w-full">
                {friendRequests.map((request: FriendRequestType) => (
                  <div className="flex w-full flex-row  justify-between gap-2" key={request.friendshipId}>
                    <p>{request.sender.email}</p>
                    <div className="flex flex-row items-center gap-1">
                      <XCircleIcon
                        onClick={() => handleRejectRequest(request.friendshipId)}
                        className="h-6 w-6 cursor-pointer"
                      />
                      <CheckCircleIcon
                        onClick={() => handleAcceptRequest(request.friendshipId)}
                        className="h-6 w-6 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
