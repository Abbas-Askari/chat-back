const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

UserSchema.virtual("url").get(function () {
  return `/users/${this._id}`;
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
