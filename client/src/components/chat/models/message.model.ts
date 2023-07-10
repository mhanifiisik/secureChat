export interface Message {
  messageId?: string;
  senderId?: string;
  receiverId: string;
  content: string;
}
export default Message;
