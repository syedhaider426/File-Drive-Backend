const fs = require("fs");

// /routes/test.txt != routes/test.txt;
// /routes meaning C:/routes
// routes/test.txt meanings current working directory/routes

// fs - everything is asynchronous
module.exports = function (app) {
  app.get("/", (req, res) => {
    console.log("Current working directory", process.cwd());
    fs.access("routes/delete.txt", fs.constants.F_OK, (err) => {
      console.log(`routes/delete.txt ${err ? "does not exist" : "exists"}`);
      if (!err)
        fs.unlink("routes/delete.txt", (err, data) => {
          if (err) throw err;
          console.log("Successfully deleted delete.txt");
        });
    });

    fs.open("routes/newFile.txt", "r", (err, fd) => {
      if (err) throw err;
      console.log("Opening File");
      fs.readFile("routes/newFile.txt", (err, data) => {
        if (err) throw err;
        console.log("Read File:", data);
      });
      fs.close(fd, (err) => {
        if (err) throw err;
        console.log("Closed File");
      });
    });
    fs.stat("routes/newFile.txt", (err, stats) => {
      if (err) throw err;
      console.log(`stats: ${JSON.stringify(stats)}`);
    });
    fs.writeFile("routes/newFile.txt", "loren ipsum text", "utf-8", (err) => {
      if (err) throw err;
      console.log("Random text to newFile.txt");
    });
    res.sendStatus(200);
  });
};
