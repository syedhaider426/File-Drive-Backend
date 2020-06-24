const { checkAuthenticated } = require("../middlewares/requireLogin");
const { getFolders } = require("../controllers/folderUploadController");
module.exports = (app) => {
  app.get("/viewFolders", checkAuthenticated, async (req, res) => {
    const folders = await getFolders(req, res);
    var htmlString = "";
    for (let x = 0; x < folders.length; ++x) {
      htmlString += `<div><label>Title - ${folders[x].Title}</label>
         <label>Description - ${folders[x].Description}</label>
         <label>Created - ${folders[x].CreatedOn} by ${folders[x].CreatedBy}</label>
         <label>Modified - ${folders[x].LastUpdatedOn} by ${folders[x].LastUpdatedBy}</label>
         </div>
         </br>
         </br>
        `;
    }

    res.send(htmlString);
  });
  app.get("/createFolder", (req, res) => {
    res.send(`
              <h2>With <code>"Create Folder"</code></h2>
              <form action="/createFolder" method="post" name="resendEmailVerification">
                <div><label class="folder">Folder: </label><input type="text" name="title" /></div>     
                <button type="submit" value="Confirm">Confirm</button>
              </form>
            `);
  });
};
