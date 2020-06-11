const fs = require("fs");
const File = require("../models/file");
// /routes/test.txt != routes/test.txt;
// /routes meaning C:/routes
// routes/test.txt meanings current working directory/routes

// fs - everything is asynchronous
module.exports = function (app) {
  app.get("/", async (req, res) => {
    /* Deletes a file */
    console.log("Current working directory", process.cwd());
    fs.access("routes/delete.txt", fs.constants.F_OK, (err) => {
      console.log(`routes/delete.txt ${err ? "does not exist" : "exists"}`);
      if (!err)
        fs.unlink("routes/delete.txt", (err, data) => {
          if (err) throw err;
          console.log("Successfully deleted delete.txt");
        });
    });

    /* Reads a file and saves it to MongoDB*/
    fs.open("routes/newFile.txt", "r", (err, fd) => {
      if (err) throw err;
      console.log("Opening File");
      fs.readFile("routes/newFile.txt", (err, data) => {
        if (err) throw err;
        console.log("Read File:", data);
        const file = new File({ file: data });
        const value = file
          .save()
          .then(() => console.log("File saved"))
          .catch((err) => console.log(err));
      });
      fs.close(fd, (err) => {
        if (err) throw err;
        console.log("Closed File");
      });
    });

    /* Confirms that data in file is saved and can be written to a new file */
    const result = await File.find();
    var f = result[0].file;
    fs.writeFile("routes/newFile2.txt", f, (err) => {
      if (err) throw err;
      console.log("Successfully saved!");
    });

    /* Gets the statistics for a file */
    fs.stat("routes/newFile.txt", (err, stats) => {
      if (err) throw err;
      console.log(`stats: ${JSON.stringify(stats)}`);
    });

    res.sendStatus(200);
  });
};
