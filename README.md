## Typora Image Uploader

A simple [typora](https://typora.io/) image uploader integrate with aws-s3. It uploads your image to s3 and use CDN_URL to serve asset.

- using [sharp](https://www.npmjs.com/package/sharp) to compress image
  - currently it's hard-coded into code. (png: quality 0.6, jpg: quality 0.7)
- upload image to `/images/{uuid}.{ext}`
- using `short-uuid` to prevent naming conflict
