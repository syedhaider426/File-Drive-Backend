const fs = require("fs");
const File = require("../models/file");
const path = require("path");
// /routes/test.txt != routes/test.txt;
// /routes meaning C:/routes
// routes/test.txt meanings current working directory/routes

//File tradeoffs - MongoDB
//https://alexmarquardt.com/2017/03/02/trade-offs-to-consider-when-storing-binary-data-in-mongodb/

// fs - everything is asynchronous
module.exports = function (app) {
  /* This will do the first one only */
  app.get("/", async (req, res) => {
    res.send("Hello World");
  });

  app.get("/delete", (req, res) => {
    /* Deletes a file */
    //console.log("Current working directory", process.cwd());
    fs.access("routes/delete.txt", fs.constants.F_OK, (err) => {
      console.log(`routes/delete.txt ${err ? "does not exist" : "exists"}`);
      if (!err)
        fs.unlink("routes/delete.txt", (err, data) => {
          if (err) throw err;
          console.log("Successfully deleted delete.txt");
        });
    });
  });
  app.get("/writeFile", async (req, res) => {
    /* Reads a file and saves it to MongoDB*/
    fs.readFile("routes/newFile.txt", async (err, data) => {
      if (err) throw err;
      const file = new File({ name: "newFile.txt", file: data });
      const value = await file.save();

      /* Confirms that data in file is saved and can be written to a new file */
      const result = await File.find({});
      var f = result[0].file;

      fs.writeFile("routes/newlyCreatedFile.txt", f, (err) => {
        if (err) throw err;
        res.send("File saved!");
      });
    });
    /* You don't need to use fs.close after writing File
     * readFile,writeFile,appendFile don't return a fd (file descriptor)
     *
     * It automatically closes file after writing to a file
     */
  });

  app.get("/stats", (req, res) => {
    /* Gets the statistics for a file */
    fs.stat("routes/newFile.txt", (err, stats) => {
      if (err) throw err;
      res.json(stats);
    });
  });
};
