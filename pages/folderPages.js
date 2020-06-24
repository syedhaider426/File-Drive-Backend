const { checkAuthenticated } = require("../middlewares/requireLogin");
const checkFolderExists = require("../middlewares/checkFolderExists");
const { getFolders } = require("../controllers/folderUploadController");
const { getFiles } = require("../controllers/fileUploadController");
module.exports = (app) => {
  app.get("/viewFolders", checkAuthenticated, async (req, res) => {
    const folders = await getFolders(req, res);
    var htmlString = "";

    for (let x = 0; x < folders.length; x++) {
      htmlString += `<div>
        <label>Title - <a href="/folder/${folders[x]._id}">${folders[x].Title}</a></label>
         </div>
         </br>
         </br>
        `;
    }
    htmlString += ` <h2>With <code>"Create Folder"</code></h2>
    <form action="/createFolder" method="post" name="createFolder">
      <div><label >Folder: </label><input type="text" name="title" /></div>
      <button type="submit" value="Confirm">Confirm</button>
    </form>`;
    res.send(htmlString);
  });

  app.get(
    "/folder/:folder",
    checkAuthenticated,
    checkFolderExists,
    async (req, res) => {
      const files = await getFiles(req, res);
      var htmlString = "";
      if (files.length == 0) {
        htmlString += `<label>No files found</label>`;
      } else {
        for (let x = 0; x < files.length; ++x) {
          htmlString += `<div><label>File - ${files[x].filename}</label>
         </div>
         </br>
         </br>
        `;
        }
      }
      htmlString += `<h2>With <code>"File Upload"</code></h2>
    <form action="/api/upload/${req.params.folder}" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div><label class="File">File:</label> <input type="file" name="someExpressFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>`;
      res.send(htmlString);
    }
  );
};
