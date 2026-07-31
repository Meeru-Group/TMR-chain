const crypto = require("crypto");

function sha256(data) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}

function getTimestamp() {
  return Date.now();
}

module.exports = {
  sha256,
  getTimestamp
};
