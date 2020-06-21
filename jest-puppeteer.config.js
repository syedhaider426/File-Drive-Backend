// jest-puppeteer.config.js
module.exports = {
  launch: {
    dumpio: true,
    headless: false,
  },
  browser: "chromium",
  browserContext: "default",
};
