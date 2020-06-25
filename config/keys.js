const keysEnvironment = process.env.NODE_ENV;
if (keysEnvironment === "production") {
  module.exports = require("./prod");
} else {
  module.exports = require("./dev");
}
