const express = require("express");
const upload = require("../upload");
const Attachment = require("../models/attachment");
const router = express.Router();

router.get("/", (req, res, next) => {
  const files = User.find({}).exec();
  res.json({ files });
});

router.post("/", upload.array("imagesToUpload", 10), async (req, res, next) => {
  console.log("checking files: ", req.body, req.files);
  const result = await Attachment.insertMany(req.files);
  console.log(result);
  return res.json({ files: result });
});

//   router.post("/", upload.array("files", 10), async (req, res, next) => {
//     console.log("checking files: ", req.body, req.files);
//     return res.json({ gotTheFiles: true });
//   });

// router.delete("/", async (req, res, next) => {
//   User.findByIdAndDelete(req.body.id);
// });

module.exports = router;
