import SocketProvider from '../../utils/socket-provider';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
