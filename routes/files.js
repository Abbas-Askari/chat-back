const express = require("express");
const { upload, getGfs, getGridfsBucket } = require("../upload");
const Attachment = require("../models/attachment");
const router = express.Router();

router.get("/", (req, res, next) => {
  const files = User.find({}).exec();
  res.json({ files });
});

router.get("/:name", async (req, res) => {
  console.log("Getting request for: ", req.params.name);
  // getGfs().files;
  const file = await getGfs().files.findOne({
    filename: req.params.name,
  });
  if (file) {
    const readStream = getGridfsBucket().openDownloadStreamByName(
      req.params.name
    );
    readStream.pipe(res);
  } else {
    res.status(404).json({ message: "File not found!" });
    const files = await getGfs().files.find().toArray();
    console.log(files.map((file) => file.filename));
  }
});

router.post("/", upload.array("imagesToUpload", 10), async (req, res, next) => {
  // router.post("/", upload.array("imagesToUpload", 10), async (req, res, next) => {
  console.log("checking files: ", req.body, req.files, req.files);
  const result = await Attachment.insertMany(req.files);
  console.log({ result, files: req.files });
  return res.json({ files: result });
});

module.exports = router;
