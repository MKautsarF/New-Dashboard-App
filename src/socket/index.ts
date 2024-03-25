import { config } from "@/config";

import * as net from "net";

export const server = net.createServer();

// Array to store client sockets
export const socketClients: net.Socket[] = [];

server.on("connection", (socket) => {
  console.log("Client connected");

  // Add the new client socket to the array
  socketClients.push(socket);

  // Handle data received from socketClients
  // socket.on("data", (data) => {
  //   console.log("Data from client:", data.toString());

  //   // Broadcast the received data to all socketClients
  //   socketClients.forEach((client) => {
  //     // Make sure not to send the data back to the sender
  //     if (client !== socket) {
  //       client.write(data);
  //     }
  //   });
  // });

  socket.on("end", () => {
    console.log("Client disconnected");
    handleClientDisconnect(socket);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
    handleClientDisconnect(socket);
  });
});

export function handleClientDisconnect(socket: net.Socket) {
  const index = socketClients.indexOf(socket);
  if (index !== -1) {
    socketClients.splice(index, 1);
  }
  console.log(socketClients);
}

const PORT = config.SOCKET_PORT;
const IP_ADDRESS = config.SOCKET_HOST;

server.listen(PORT, IP_ADDRESS, () => {
  console.log(`Server listening on ${IP_ADDRESS}:${PORT}`);
});

// Function to send text to connected clients
export function sendTextToClients(text: string) {
  socketClients.forEach((socket) => {
    socket.write("data|" + text);
    console.log("data|" + text);
  });
}

// Example usage of the function
// Call this function whenever you want to send text to connected clients
// sendTextToClients('Hello from the server!');
