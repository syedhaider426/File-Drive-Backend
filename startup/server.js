const helmet = require("helmet");
const cors = require("cors");

module.exports = function (app) {
  app.use(helmet());
  app.use(cors());
  app.get("/", (req, res) => {
    res.send(`
          <h2>With <code>"express"</code> npm package</h2>
          <form action="/api/upload" enctype="multipart/form-data" method="post">
            <div>Text field title: <input type="text" name="title" /></div>
            <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
            <input type="submit" value="Upload" />
          </form>
          
        `);
  });
  app.set("view engine", "ejs");
};
