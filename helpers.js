const util = require("util");
const gc = require("../config");
const bucket = gc.bucket("auto-delete-in-30-days"); // should be your bucket name
const vision = require('@google-cloud/vision');
const path = require('path');
const serviceKey = path.join(__dirname, './keys.json');

class ImageUploadHelper {
  constructor() {}

  uploadImage = (file) => {
    const { originalname, buffer } = file;
    return new Promise((resolve, reject) => {
      const blob = bucket.file(originalname.replace(/ /g, "_"));
      const blobStream = blob.createWriteStream({
        resumable: false,
        public: true
      });
      blobStream
        .on("finish", () => {
          const publicUrl = util.format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
          );
          resolve(publicUrl);
        })
        .on("error", () => {
          reject(`Unable to upload image, something went wrong`);
        })
        .end(buffer);
    });
  }
 
};



  module.exports = ImageUploadHelper;