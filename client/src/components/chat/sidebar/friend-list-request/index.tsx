import type { FC } from 'react';

import type { FriendRequest } from '../..';
import FriendsButton from '../friends-button';

interface FriendRequestsProps {
  friendRequests: FriendRequest[];
  onAccept: (friendShipId: string) => void;
}

export const FriendRequests: FC<FriendRequestsProps> = ({ friendRequests, onAccept }) => {
  return (
    <div className="flex w-60 flex-col items-start gap-2 overflow-auto border-r p-4">
      <h1 className="mb-2">Friend list requests:</h1>
      {friendRequests.map((request) => (
        <FriendsButton
          key={request.id}
          friendName={request.id.toString()}
          active={true}
          onAccept={() => onAccept(request.id.toString())}
        />
      ))}
    </div>
  );
};
