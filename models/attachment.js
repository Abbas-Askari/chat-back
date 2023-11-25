const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    mimetype: { type: String, required: true },
    originalname: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: false },
    size: { type: Number },
  },
  {
    toJSON: { virtuals: true },
  }
);

attachmentSchema.virtual("url").get(function () {
  return `http://localhost:3000/files/${this.filename}`;
});

// attachmentSchema.virtual("url").get(function () {
//   return `http://localhost:3000/${this.path}`;
// });

const Attachment = mongoose.model("Attachment", attachmentSchema);

module.exports = Attachment;
