const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  // messages = [
  //    {id: someUserId //not including
  //       messages: [{
  //          id: message.id //default mongoose ID
  //       }]
  //    }
  // ]
  members: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  ],
  admin: { type: Date, required: true },
  recived: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  sent: { type: Boolean, default: false },
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
