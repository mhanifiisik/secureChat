'use client';

import { PlusIcon } from '@heroicons/react/24/solid';
import type { FC } from 'react';
import { useState } from 'react';

import FriendsButton from '../friends-button';

interface Friend {
  id: number;
  name: string;
}

interface FriendListProps {
  friends: Friend[];
  onAddFriend: (email: string) => void;
}

export const FriendList: FC<FriendListProps> = ({ friends, onAddFriend }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const handleAddFriend = () => {
    if (email.trim() !== '') {
      onAddFriend(email);
      setEmail('');
      setModalOpen(false);
    }
  };
  return (
    <div className="flex w-60 flex-col items-start gap-2 overflow-auto border-r p-4">
      <div className="mb-2 flex w-full flex-row  justify-between">
        <h1>Friend List:</h1>
        <button onClick={() => setModalOpen(true)}>
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      {friends.map((friend) => (
        <FriendsButton key={friend.id} friendName={friend.name} active={true} />
      ))}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded bg-white p-4 shadow">
            <h2>Add Friend</h2>
            <input
              type="email"
              className="mb-2 rounded border p-2"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex justify-end">
              <button className="rounded bg-blue-500 px-4 py-2 text-white" onClick={handleAddFriend}>
                Add
              </button>
              <button className="ml-2 rounded bg-gray-300 px-4 py-2 text-gray-700" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
