import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentSocketUserId = "";

export const getSocket = (
  userId: string,
  userName = "User",
  role = "USER",
): Socket => {
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost";

  if (!socket || !socket.connected || currentSocketUserId !== userId) {
    if (socket) {
      socket.disconnect();
    }

    currentSocketUserId = userId;

    socket = io(`${socketUrl}/chat`, {
      query: {
        userId,
        userName,
        role,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentSocketUserId = "";
  }
};
