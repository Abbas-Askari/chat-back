require("dotenv").config();
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const mongoose = require("mongoose");
const fs = require("fs");
var bodyParser = require("body-parser");
// let users = require("./users.js");

mongoose
  .connect(process.env.MONGO_URL)
  .then(async (data) => {
    console.log("connected");
    // const res = await Attachment.deleteMany({ size: { $gt: 10000 } });
    // console.log({ res });
  })
  .catch((err) => console.error(err));

const app = express();
app.use(cors());

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.get("/uploads/:imageName", (req, res) => {
//   // do a bunch of if statements to make sure the user is
//   // authorized to view this image, then
//   try {
//     const imageName = req.params.imageName;
//     const readStream = fs.createReadStream(`uploads/${imageName}`);
//     readStream.pipe(res);
//   } catch (e) {
//     console.log("Error occured in finding a the file: ", req.params.imageName);
//     console.log("Error: ", e);
//   }
// });

const server = createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:5173",
    // https://chat-app-abbas.netlify.app/
    origin: ["https://chat-app-abbas.netlify.app", "http://localhost:5173"],
  },
});

const User = require("./models/user.js");
const Message = require("./models/message.js");
const userRouter = require("./routes/users.js");
app.use("/users", userRouter);
const fileRouter = require("./routes/files.js");
const Attachment = require("./models/attachment.js");
app.use("/files", fileRouter);

// Messages sent by Sender but not recieved by reciever because offline.
const tempMessages = [];

io.use(async (socket, next) => {
  let users = await User.find({}).exec();

  const { username, password, token } = socket.handshake.auth;
  if (token) {
    jwt.verify(token, "secret", async (err, user) => {
      if (err) {
        return next(err);
      } else {
        let u = await User.findOne({
          username: user.username,
          password: user.password,
        }).exec();
        socket.user = u;
        return next();
      }
    });
  } else {
    // const user = users.find(
    //   (user) => user.username === username && user.password === password
    // );

    let user = await User.findOne({ username, password }).exec();
    if (!user) {
      next(
        new Error("Cannot find a user with the provided username and password!")
      );
    } else {
      user = { ...user._doc, id: user._id };
      socket.user = user;
      const avatar = user.avatar;
      jwt.sign(
        { username: user.username, password: user.password, id: user.id },
        "secret",
        (err, token) => {
          socket.token = token;
          next();
        }
      );
    }
  }
});

io.on("connect", async (socket) => {
  let users = await User.find({}).exec();

  console.log("Connected: " + socket.user.username);
  for (const [id, socket] of io.of("/").sockets) {
    if (socket.connected) {
      socket.user.status = "Online";
      users = users.map((user) =>
        user.id === socket.user.id ? socket.user : user
      );
    }
  }
  socket.join(socket.user.id.toString());

  socket.broadcast.emit("online", socket.user.id);
  socket.emit("users", users);
  socket.emit("session", { user: socket.user, token: socket.token });

  socket.on("ready_to_recive", () => {
    Message.find({
      $or: [{ sentTo: socket.user.id }, { sentBy: socket.user.id }],
    })
      .populate("attachment")
      .exec()
      .then((messages) => {
        socket.emit("recive_initial_messages", { messages });
      });
  });

  socket.on("send_message", async (m, cb) => {
    m.sent = true;
    m.attachment = new Attachment(m.attachment);
    const message = new Message(m);
    message.save();
    if (m.attachment) {
      await message.populate("attachment");
    }
    console.log({ m, message });
    socket.to(message.sentTo._id.toString()).emit("recieve_message", message);
    cb({ ok: true, messageId: message._id.toString() });
  });

  socket.on("recieved_message_by_user", (message) => {
    // Dont recive messages already recived
    message.recived = true;
    const bundleId =
      message.sentBy.toString() === socket.user.id
        ? message.sentTo
        : message.sentBy;
    // console.log({ message, user: socket.user, bundleId });
    Message.findByIdAndUpdate(message._id, { recived: true })
      .exec()
      .catch((err) => console.error(err));
    // socket.to(message.sentBy).emit("recieved_by_other", {
    socket.to(message.sentBy).emit("recived_by_other", {
      messageId: message._id,
      bundleId: message.sentTo,
    });
  });

  socket.on("read_all_messages_of_user", (userId) => {
    socket.to(userId).emit("messages_got_read", socket.user.id);

    Message.updateMany(
      {
        sentBy: userId,
        sentTo: socket.user.id,
      },
      {
        read: true,
        recived: true, //?
      }
    ).exec();

    // tempMessages.forEach((message) => {
    //   if (message.sentBy === userId && message.sentTo === socket.user.id) {
    //     message.read = true;
    //   }
    // });
  });

  socket.on("typing_to", (userId) => {
    socket.to(userId).emit("typing_from", socket.user.id);
  });

  socket.on("ended_typing_to", (userId) => {
    socket.to(userId).emit("ended_typing_from", socket.user.id);
  });

  socket.on("disconnect", async () => {
    console.log("Disconnected: " + socket.user.username);
    const userSockets = await io.in(socket.user.id).fetchSockets();
    if (userSockets.length === 0) {
      socket.user.status = "Offline";
      socket.broadcast.emit("offline", socket.user.id);
    }
  });
});

server.listen(3000, () => {
  console.log("Server started listening port 3000/");
});
