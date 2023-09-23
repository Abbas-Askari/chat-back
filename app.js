const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
let users = require("./users.js");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.use((socket, next) => {
  const { username, password, token } = socket.handshake.auth;
  console.log({ username, password, token });
  if (token) {
    jwt.verify(token, "secret", (err, user) => {
      if (err) {
        return next(err);
      } else {
        socket.user = user;
        return next();
      }
    });
  } else {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (!user) {
      next(
        new Error("Cannot find a user with the provided username and password!")
      );
    } else {
      socket.user = user;
      jwt.sign(user, "secret", (err, token) => {
        socket.token = token;
        next();
      });
    }
  }
});

io.on("connect", (socket) => {
  // console.log({ sockets: io.of("/").sockets });
  // io.of("/").sockets.then((data) => console.log({ sockets: data }));
  console.log("Connected: " + socket.user.username);
  for (const [id, socket] of io.of("/").sockets) {
    if (socket.connected) {
      socket.user.status = "Online";
      users = users.map((user) =>
        user.id === socket.user.id ? socket.user : user
      );
    }
    console.log({ userOnline: socket.user, socket });
  }
  console.log({ users });
  socket.join(socket.user.id);

  socket.broadcast.emit("online", socket.user.id);
  socket.emit("users", users);
  socket.emit("session", { user: socket.user, token: socket.token });

  socket.on("send_message", (message) => {
    socket.to(message.sentTo).emit("recieve_message", message);
    console.log({ message });
  });

  socket.on("disconnect", async () => {
    console.log("Disconnected: " + socket.user.username);
    const userSockets = await io.in(socket.user.id).fetchSockets();
    console.log({ userSockets });
    if (userSockets.length === 0) {
      socket.user.status = "Offline";
      socket.broadcast.emit("offline", socket.user.id);
    }
  });
});

server.listen(3000, () => {
  console.log("Server started listening on http://localhost:3000/");
});
