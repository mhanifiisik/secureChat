'use client';
import React, { ReactNode, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface DropdownProps {
  open: boolean;
  buttonText: string;
  dropdownMenuContent: ReactNode | ReactNode[];
  handleToggleDropDown?: () => void;
  handleCloseDropDown?: () => void;
}

export function Dropdown({
  open,
  buttonText,
  dropdownMenuContent,
  handleToggleDropDown,
  handleCloseDropDown,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleCloseDropDown?.();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleCloseDropDown]);

  return (
    <div className="relative flex flex-col items-center rounded-lg">
      <button
        onClick={handleToggleDropDown}
        className="py-2.5 px-5 mr-2 gap-2 mb-2 text-sm flex flex-row items-center justify-between font-medium focus:outline-none  rounded-lg border  focus:z-10 focus:ring-4  focus:ring-gray-700 bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700 duration-300"
      >
        {buttonText}
        {open ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
      </button>
      {open && (
        <div
          className=" bg-gray-800 absolute top-14 flex flex-col items-start w-full right-0 left-0 z-10 rounded-lg shadow-lg"
          ref={dropdownRef}
        >
          {dropdownMenuContent}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
