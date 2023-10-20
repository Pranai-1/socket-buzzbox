const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const app = express();
const port = 4000;
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(cors({
  origin: 'https://buzz-box.vercel.app',
  optionsSuccessStatus: 200,
}));

const io = socketIO(server, {
  cors: {
    origin: "https://buzz-box.vercel.app",
    methods: ["GET", "POST"],
  },
});

let users = [];
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log(`connection established with id-${socket.id}`);

  socket.on("addNewUser", async (userId) => {
    try {
      const present = await prisma.onlineUsers.findFirst({
        where: {
          userId,
        },
      });

      if (present) {
        // If the user is already present, update the socketId
        await prisma.onlineUsers.update({
          where: {
            id: present.id, // Use the id as the unique identifier
          },
          data: {
            socketId: socket.id,
          },
        });
      } else {
        // If the user is not present, create a new record
        await prisma.onlineUsers.create({
          data: {
            userId,
            socketId: socket.id,
          },
        });
      }

      const updatedOnlineUsers = await prisma.onlineUsers.findMany({});
      console.log(updatedOnlineUsers);
      socket.emit("getOnlineUsers", updatedOnlineUsers);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("sendMessage", async (message) => {
    console.log(message);
    console.log(message.userIdOfOpenedChat + " ");
    console.log(onlineUsers);

    const user = await prisma.onlineUsers.findFirst({
      where: {
        userId: message.userIdOfOpenedChat,
      },
    });

    if (user) {
      socket.to(user.socketId).emit("getMessage", message.messagetosend);
    }
  });

  socket.on("disconnect", async () => {
    await prisma.onlineUsers.deleteMany({
      where: {
        socketId: socket.id,
      },
    });

    // Get the updated list of online users
    const updatedOnlineUsers = await prisma.onlineUsers.findMany();
    socket.emit("getOnlineUsers", updatedOnlineUsers);
  });
});

app.get("/", (req, res) => {
  res.send("Starting");
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
;


// Read about the diff between http and express servers with code

//    - `http`: This is a built-in Node.js module used to create an HTTP server.
//    - `express`: Express.js is a popular Node.js web application framework for building web applications and APIs.
//    - `cors`: CORS (Cross-Origin Resource Sharing) is middleware used to handle cross-origin requests and is commonly used in web
//     applications.
//    - `socketIO`: This is the Socket.IO library, which allows real-time, bidirectional communication between the server 
//    and clients using WebSockets.


// 3. **Create an HTTP Server and Attach Express:**

//    ```javascript
//    const server = http.createServer(app);
//    ```

//    - An HTTP server is created using the `http.createServer()` method. The Express application (`app`) is attached to this server, 
//    allowing it to handle incoming HTTP requests.

// 4. **Initialize Socket.IO with the Server:**

//    ```javascript
//    const io = socketIO(server);
//    ```

//    - The Socket.IO server is created and attached to the HTTP server (`server`). This allows real-time communication between clients 
//    and the server using WebSockets.

