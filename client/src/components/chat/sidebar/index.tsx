'use client';

import { ArrowLeftOnRectangleIcon, HomeIcon, UserPlusIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const menuItems = [
  { id: 1, name: 'home', icon: <HomeIcon className="h-6 w-6" /> },
  { id: 2, name: 'friends', icon: <UsersIcon className="h-6 w-6" /> },
  { id: 3, name: 'friendRequests', icon: <UserPlusIcon className="h-6 w-6" /> },
  {
    id: 4,
    name: 'logout',
    icon: <ArrowLeftOnRectangleIcon className="h-6 w-6" />,
  },
];

interface ChatSideBarProps {
  onMenuClick: (menuItem: string) => void;
}
export const ChatSideBar = ({ onMenuClick }: ChatSideBarProps) => {
  const [activeMenuItem, setActiveMenuItem] = useState('home');

  const handleMenuClick = (menuItem: string) => {
    setActiveMenuItem(menuItem);
    onMenuClick(menuItem);
  };

  return (
    <aside className="flex">
      <div className="flex h-screen w-16 flex-col items-center space-y-8 bg-white py-8 dark:border-gray-700 dark:bg-gray-900">
        <a href="#">
          <img className="h-6 w-auto" src="https://merakiui.com/images/logo.svg" alt="" />
        </a>

        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${
              activeMenuItem === item.name
                ? 'bg-gray-600 text-blue-400 '
                : 'bg-gray-800 text-gray-400 hover:bg-gray-100'
            }focus:outline-nones  rounded-lg p-1.5 transition-colors duration-200`}
            onClick={() => handleMenuClick(item.name)}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </aside>
  );
};
