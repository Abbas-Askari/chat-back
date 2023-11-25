// const multer = require("multer");

// // Set up storage for uploaded files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + "-" + Date.now() + file.originalname);
//   },
// });

// // Create the multer instance
// const upload = multer({ storage: storage });

// module.exports = upload;

const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

const Attachment = require("./models/attachment");
const Message = require("./models/message");

const conn = mongoose.createConnection(process.env.MONGO_URL);

let gfs, gridfsBucket;
conn.once("open", async () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });

  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  // const result = await Message.deleteMany({});
  // console.log({ result });
  // Attachment.deleteMany({});
  // gfs.files.deleteMany({});
});

const storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename =
          path.basename(file.originalname) +
          buf.toString("hex") +
          path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          originalname: file.originalname,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });
module.exports = {
  upload,
  getGfs: () => gfs,
  getGridfsBucket: () => gridfsBucket,
};
