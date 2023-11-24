const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    mimetype: { type: String, required: true },
    originalname: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number },
  },
  {
    toJSON: { virtuals: true },
  }
);

attachmentSchema.virtual("url").get(function () {
  return `https://chat-app-abbas.netlify.app/${this.path}`;
});

const Attachment = mongoose.model("Attachment", attachmentSchema);

module.exports = Attachment;
