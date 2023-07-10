import { type Message } from './message.model';

export interface User {
  createdAt: string;
  email: string;
  name: string;
  status: string;
  updatedAt: string;
  userId: string;
  messages: Message[];
}
export default User;
