import { type Friendship } from './friendship.model';
import { type User } from './user.model';

export interface FriendRequest extends Friendship {
  sender: User;
}
export default FriendRequest;
