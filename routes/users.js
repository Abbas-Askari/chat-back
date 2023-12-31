const express = require("express");
const User = require("../models/user");
const { upload } = require("../upload");
const router = express.Router();

router.get("/", (req, res, next) => {
  const users = User.find({}).exec();
  res.json({ users });
});

router.post("/", upload.single("avatar"), async (req, res, next) => {
  // const post = Post({
  //     title: req.body.title,
  //     content: req.body.content,
  //     author: req.user,
  //     date: new Date(),
  //   });
  //   const result = await post.save();
  const { password, username } = req.body;
  console.log(req.body);
  if (!username) {
    return res.status(400).json({ error: "Please provide a valid username" });
  }
  if (!password) {
    return res.status(400).json({ error: "Please provide a valid password" });
  }
  const user = new User({
    username,
    password,
    avatar: req.file
      ? "https://abbas-chat-back.onrender.com/" + req.file.path
      : null,
    // avatar: req.file ? "http://localhost:3000/" + req.file.path : null,
  });
  const result = await user.save();
  return res.json({ result });
});

router.delete("/", async (req, res, next) => {
  User.findByIdAndDelete(req.body.id);
});

module.exports = router;
