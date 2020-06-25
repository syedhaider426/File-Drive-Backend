const { checkAuthenticated } = require("../middlewares/requireLogin");
const checkFolderExists = require("../middlewares/checkFolderExists");
const { getFolders } = require("../controllers/folderController");
const { getFiles } = require("../controllers/fileController");
module.exports = (app) => {
  app.get("/viewFolders", checkAuthenticated, async (req, res) => {
    const folders = await getFolders(req, res);
    var htmlString = "";

    for (let x = 0; x < folders.length; x++) {
      htmlString += `<div>
        <label>Title - <a href="/folder/${folders[x]._id}">${folders[x].Title}</a></label>

        `;
      htmlString += `  <form action="/renameFolder" method="post" name="Login">
        <input type="text" name="folder">
        <input type="hidden" name="folderID" value=${folders[x]._id}>
      <button id="renameFolder" type="submit" value="Rename Folder">Rename Folder</button>
    </form>`;
    }

    res.send(htmlString);
  });

  app.get(
    "/folder/:folder",
    checkAuthenticated,
    checkFolderExists,
    async (req, res) => {
      const files = await getFiles(req, res);

      const folders = await getFolders(req, res);

      /****************** */
      var folderString = `<select name="folder" onChange='document.getElementById("move").disabled = false'>"`;
      for (let j = 0; j < folders.length; ++j) {
        folderString += `<option value=${folders[j]._id}>${folders[j].Title}</option>`;
      }
      folderString += `</select>`;
      /****************** */
      var htmlString = "";
      if (files.length == 0) {
        htmlString += `<label>No files found</label>`;
      } else {
        for (let x = 0; x < files.length; ++x) {
          htmlString +=
            `<form action="/moveFiles" method="post" name="MoveFile">
          <input type="hidden" name="files" value=${files[x]._id}>
          <label>${files[x].filename}</label>
        ` +
            folderString +
            `
          <button id="move" type="submit" disabled value="Move File">Move File</button>
        </form>
        <form action="/deleteFiles" method="post" name="DeleteFile">
          <input type="hidden" name="files" value=${files[x]._id}>
          <label>${files[x].filename}</label>
          <button id="delete" type="submit" value="Delete File">Delete File</button>
        </form>
        <form action="/renameFile" method="post" name="RenameFile">
          <input type="text" name="newName">
          <input type="hidden" name="files" value=${files[x]._id}>
          <input type="hidden" name="currentName" value=${files[x].filename}>
          <label>${files[x].filename}</label>
        <button id="rename" type="submit" value="Rename File">Rename File</button>
      </form>
      <form action="/copyFile" method="post" name="Copy">
      <input type="hidden" name="fileID" value=${files[x]._id}>
      <input type="hidden" name="fileName" value=${files[x].filename}>
      <input type="hidden" name="folder" value=${req.params.folder}>
      <label>${files[x].filename}</label>
    <button id="copy" type="submit" value="Copy File">Copy File</button>
  </form>
         </div>
         </br>
         </br>
        `;
        }
      }

      /****************** */

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
