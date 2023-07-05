'use client';

import type { FC } from 'react';
import React from 'react';

interface FriendsButtonProps {
  friendName: string;
  active?: boolean;
  onAccept?: () => void;
}

const FriendsButton: FC<FriendsButtonProps> = ({ friendName, active, onAccept }) => (
  <button
    className={`flex w-full items-center justify-between gap-x-2 px-5 py-2 transition-colors duration-200 hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-800 ${
      active &&
      'rounded-lg bg-blue-100 text-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:text-blue-400'
    }`}
    onClick={onAccept}
  >
    <h1 className="text-sm font-medium capitalize text-gray-700 dark:text-white">{friendName}</h1>
    {active && <span className="h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>}
  </button>
);

export default FriendsButton;
