const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  // messages = [
  //    {id: someUserId //not including
  //       messages: [{
  //          id: message.id //default mongoose ID
  //       }]
  //    }
  // ] run
  content: { type: String, required: contentRequirment },
  sentBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  sentTo: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  date: { type: Date, required: true },
  recived: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  sent: { type: Boolean, default: false },
  attachment: { type: mongoose.Schema.Types.ObjectId, ref: "Attachment" },
});

function contentRequirment() {
  return typeof this.content === "string" ? false : true;
}

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
