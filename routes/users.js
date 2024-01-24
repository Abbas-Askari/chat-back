const express = require("express");
const User = require("../models/user");
const { upload } = require("../upload");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/", (req, res, next) => {
  const users = User.find({}).exec();
  res.json({ users });
});

router.post("/", async (req, res, next) => {
  const { password, username, avatar } = req.body;
  // console.log({ body: req.body, req });
  if (!username) {
    return res.status(400).json({ error: "Please provide a valid username" });
  }
  if (!password) {
    return res.status(400).json({ error: "Please provide a valid password" });
  }
  const user = new User({
    username,
    password,
    avatar,
  });
  const result = await user.save();
  return res.json({ result });
});

router.delete("/", async (req, res, next) => {
  User.findByIdAndDelete(req.body.id);
});

router.patch("/", async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(400).json({ error: "Please provide a valid token" });
  }

  jwt.verify(token, "secret", async (err, user) => {
    if (err) {
      return res.status(400).json({ error: "Please provide a valid token" });
    } else {
      const { username, password, avatar } = req.body;
      const updates = {
        username,
        password,
        avatar,
      };

      if (!avatar) {
        delete updates.avatar;
      }

      const result = await User.findByIdAndUpdate(
        user.id,
        { $set: updates },
        { new: true }
      );
      console.log({ result });
      return res.json({ result });
    }
  });
});

module.exports = router;
