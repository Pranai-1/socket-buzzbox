const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");


const app = express();
const port = 4000;
const server = http.createServer(app);


app.use(cors({
  origin: 'https://buzz-box.vercel.app',
  optionsSuccessStatus: 200,
}));


// app.use(cors())
// const io=socketIO(server)
const io = socketIO(server, {
  cors: {
    origin: "https://buzz-box.vercel.app",
    methods: ["GET", "POST"],
  },
});


let users = {}; 

io.on("connection", (socket) => {
  console.log(`Connection established with id-${socket.id}`);
  socket.on("addNewUser", (userId) => {
    if (users[userId]) {
      users[userId].socketId = socket.id;
    } else {
      users[userId] = { userId, socketId: socket.id };
    }
    const onlineUsers = Object.values(users);
    if (onlineUsers) {
      for(let arr of onlineUsers ){
        io.to(arr.socketId).emit("getOnlineUsers", onlineUsers);
        console.log(arr)
      }
      
    }

  });

  socket.on("sendMessage", (message) => {
    const user = users[message.userIdOfOpenedChat];
    if (user) {
      io.to(user.socketId).emit("getMessage", message.messagetosend);
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUser = Object.values(users).find((user) => user.socketId === socket.id);
    if (disconnectedUser) {
      delete users[disconnectedUser.userId];
    }

    const onlineUsers = Object.values(users);
    if (onlineUsers) {
      for(let arr of onlineUsers ){
        io.to(arr.socketId).emit("getOnlineUsers", onlineUsers);
        console.log(arr)
      }
      
    }
  });
});

app.get("/", (req, res) => {
  res.json({onlineUsers});
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

