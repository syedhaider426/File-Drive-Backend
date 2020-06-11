const fs = require("fs");
const File = require("../models/file");
const path = require("path");
// /routes/test.txt != routes/test.txt;
// /routes meaning C:/routes
// routes/test.txt meanings current working directory/routes

// fs - everything is asynchronous
module.exports = function (app) {
  app.get("/", async (req, res) => {
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

    /* Reads a file and saves it to MongoDB*/
    fs.open("routes/t.jpg", "r", (err, fd) => {
      if (err) throw err;
      fs.readFile("routes/t.jpg", async (err, data) => {
        if (err) throw err;
        const file = new File({ name: "t.jpg", file: data });
        const value = await file.save();

        /* Confirms that data in file is saved and can be written to a new file */
        const result = await File.find({});
        var f = result[0].file;

        fs.writeFile("routes/t2.jpg", f, (err) => {
          if (err) throw err;
          console.log("Successfully saved!");
        });
      });
      fs.close(fd, (err) => {
        if (err) throw err;
      });
    });

    /* Gets the statistics for a file */
    fs.stat("routes/newFile.txt", (err, stats) => {
      if (err) throw err;
      //console.log(`stats: ${JSON.stringify(stats)}`);
    });
  });
};
