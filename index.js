#!/usr/bin/node

const AWS = require("aws-sdk");
const path = require("path");
const sharp = require("sharp");
const uuid = require("short-uuid");
const env = require("./env.json");
const fs = require("fs");

// typora will pass file name as third parameter
const files = process.argv.slice(2);

function setupEnv() {
  if (env) {
    process.env.ACCESS_KEY_ID = env.ACCESS_KEY_ID;
    process.env.SECRET_ACCESS_KEY = env.SECRET_ACCESS_KEY;
    process.env.BUCKET = env.BUCKET;
    process.env.CDN_URL = env.CDN_URL;
  }
}
setupEnv();
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

function upload({ buffer, extname = ".jpg", bucket = process.env.BUCKET }) {
  return new Promise((resolve) => {
    const key = uuid.generate();
    const res = s3.putObject(
      {
        ACL: "public-read",
        Key: "images" + key + extname,
        Bucket: bucket,
        Body: buffer,
        ContentType: "image/" + extname.replace(".", ""),
      },
      function uploaded(err, output) {
        if (err) {
          throw new Error(err.message);
        }

        resolve(process.env.CDN_URL + `/images/${key}${extname}`);
      }
    );
  });
}

const compress = (filename) => {
  const extname = path.extname(filename).toLowerCase();
  const filepath = path.resolve(filename);
  if (extname === ".png") {
    return sharp(filepath)
      .png({ quality: 60 })
      .toBuffer()
      .then((buffer) => upload({ buffer, extname }));
  } else if (extname === ".jpg" || extname === ".jpeg") {
    return sharp(path.resolve(filename))
      .jpeg({ quality: 70 })
      .toBuffer()
      .then(upload);
  }

  return Promise.resolve(fs.readFileSync(filepath));
};

Promise.all(
  files.map((file) => {
    return compress(file);
  })
).then((files) => {
  console.log("Upload Successfully");
  console.log(files.join("\n"));
  process.exit(0);
});
