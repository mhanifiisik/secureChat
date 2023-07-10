import React from 'react';

import { AddFriend } from '../../components/chat/add-friend-modal';
import { FriendRequest } from '../../components/chat/friend-request-dropdown';
import { Friends } from '../../components/chat/friends-dropdown';
import { LogOut } from '../../components/chat/logout';
import { MessageContainer } from '../../components/chat/message-container';

export default function Chat() {
  return (
    <div className="grid min-h-screen min-w-full place-items-center bg-slate-900 text-white">
      <div className="flex flex-col md:flex-row ">
        <div id="main" className="flex flex-col">
          <div className="flex flex-wrap sm:space-x-4">
            <div className="mb-2 flex flex-nowrap justify-between">
              <AddFriend />
              <Friends />
              <FriendRequest />
              <LogOut />
            </div>
          </div>
          <MessageContainer />
        </div>
      </div>
    </div>
  );
}
