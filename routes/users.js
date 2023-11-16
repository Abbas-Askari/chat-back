const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.get("/", (req, res, next) => {
  const users = User.find({}).exec();
  res.json({ users });
});

router.post("/", async (req, res, next) => {
  // const post = Post({
  //     title: req.body.title,
  //     content: req.body.content,
  //     author: req.user,
  //     date: new Date(),
  //   });
  //   const result = await post.save();
  console.log("body", req.body);
  const { password, username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Please provide a valid username" });
  }
  if (!password) {
    return res.status(400).json({ error: "Please provide a valid password" });
  }
  const user = new User({ username, password });
  console.log({ username, password });
  const result = await user.save();
  console.log(result);
  return res.json({ result });
});

module.exports = router;
