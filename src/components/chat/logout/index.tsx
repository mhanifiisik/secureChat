'use client';

import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-toastify';

export const LogOut: React.FC = () => {
  const router = useRouter();
  const handleToggleDropdown = () => {
    Cookies.remove('token');
    toast.info('Successfully logged out');
    router.push('/');
  };

  return (
    <div className="relative flex flex-col items-center rounded-lg">
      <button
        onClick={handleToggleDropdown}
        className="mb-2 mr-2 flex flex-row items-center justify-between gap-2 rounded-lg border border-gray-600 bg-gray-800 px-5  py-2.5 text-sm  font-medium text-gray-400  duration-300 hover:bg-gray-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-700"
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
