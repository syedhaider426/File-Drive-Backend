const Connection = require("./Connection");

exports.createFiles = async (req, options) => {
  //This is necessary to trigger the events
  form.parse(req);

  // File has been received
  form.on("file", (field, file) => {
    console.log(file);
    const writestream = Connection.gfs.openUploadStream(file.name, options);
    fs.createReadStream(file.path)
      .pipe(writestream)
      .once("finish", () => {
        console.log("Finished");
      });
  });

  // If an error occurs, return an error response back to the client
  form.on("error", (err) => {
    if (err) next(err);
  });

  // Once it is finishing parsing the file, upload the file to GridFSBucket
  form.once("end", () => {
    return res.json({
      success: {
        message: "Files were sucessfully uploaded",
      },
    });
  });
};

exports.findFiles = async (whereClause) => {
  try {
    return await Connection.db
      .collection("fs.files")
      .find(whereClause)
      .toArray();
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error retrieving the file(s). Please try again.",
        },
      });
    else next(err);
  }
};

exports.deleteFiles = async (whereClause) => {
  try {
    return await Connection.db.collection("fs.files").deleteMany(whereClause);
  } catch (err) {
    next(err);
  }
};

exports.updateFiles = async (whereClause, updateClause) => {
  try {
    return await Connection.db
      .collection("fs.files")
      .update(whereClause, updateClause);
  } catch (err) {
    next(err);
  }
};

exports.findFolders = async (whereClause) => {
  try {
    return await Connection.db
      .collection("folders")
      .find(whereClause)
      .toArray();
  } catch (err) {
    next(err);
  }
};

exports.deleteFolders = async (whereClause) => {
  try {
    return await Connection.db.collection("folders").deleteMany(whereClause);
  } catch (err) {
    next(err);
  }
};

exports.createFolder = async (whereClause) => {
  try {
    return await Connection.db.collection("folders").insertOne(whereClause);
  } catch (err) {
    next(err);
  }
};

exports.updateFolders = async (whereClause, updateClause) => {
  try {
    return await Connection.db
      .collection("folders")
      .update(whereClause, updateClause);
  } catch (err) {
    next(err);
  }
};
