import { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema, ValidationResult } from "@hapi/joi";
import Connection from "../database/Connection";
import returnObjectID from "../database/returnObjectID";
import { ObjectID } from "mongodb";
import {
  findFolders,
  updateFolders,
  createFolder,
  deleteFolder,
} from "../services/folders";
import { findFiles, updateFiles } from "../services/files";

interface IUser extends Request {
  user: { _id: string };
}

const generateFolderArray = (req: Request): (string | ObjectID)[] => {
  const folders: (string | ObjectID)[] = [];
  if (req.body.selectedFolders.length > 0)
    req.body.selectedFolders.forEach((folder: { [key: string]: any }) => {
      let id: string;
      if (folder.id) id = folder.id;
      else id = folder._id; //only used when deleting all files
      folders.push(returnObjectID(id));
    });

  return folders;
};

export const getFolderDetails = async (id: string): Promise<any> => {
  return await findFolders({ _id: returnObjectID(id) });
};

export const getFolderHierarchy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result: any = await Connection.db
    .collection("folders")
    .aggregate([
      { $match: { _id: returnObjectID(req.params.folder) } }, // Only look at folder
      {
        $graphLookup: {
          from: "folders", // Use the folders collection
          startWith: "$parent_id", // Start looking at the document's `parent_id` property
          connectFromField: "parent_id", // A link in the graph is represented by the parent id property...
          connectToField: "_id", // ... pointing to another folder's _id property
          as: "connections", // Store this in the `connections` property
        },
      },
    ])
    .toArray();
  const folders: { _id: string; foldername: string }[] = [];
  const f: any[any] = result[0];
  for (let i: number = 0; i < f.connections.length; ++i) {
    folders.push({
      _id: f.connections[i]._id,
      foldername: f.connections[i].foldername,
    });
  }
  folders.push({ _id: f._id, foldername: f.foldername });
  return folders;
};

//https://stackoverflow.com/questions/52694418/error-type-is-not-a-valid-async-function-return-type-in-es5-es3-because-it-does
export const getFolders = async (req: Request): Promise<any> => {
  const result = await findFolders({
    user_id: (req as IUser).user._id,
    parent_id: returnObjectID(req.params.folder),
    isTrashed: false,
  });
  return result;
};

export const getAllFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return await findFolders({
    user_id: (req as IUser).user._id,
    isTrashed: false,
  });
};

export const getFavoriteFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return await findFolders({
    user_id: (req as IUser).user._id,
    isTrashed: false,
    isFavorited: true,
  });
};

export const getTrashFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return await findFolders({
    user_id: (req as IUser).user._id,
    isTrashed: true,
  });
};

export const create_Folder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Create JOI Schema
  const schema: ObjectSchema<any> = Joi.object({
    folder: Joi.string().required().messages({
      "string.empty": `Folder cannot be empty.`,
    }),
  });

  // Validate user inputs
  const validation: ValidationResult = await schema.validate({
    folder: req.body.folder,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  const folder: {
    foldername: any;
    user_id: string;
    parent_id: string | ObjectID;
    description: string;
    createdOn: Date;
    isTrashed: boolean;
    isFavorited: boolean;
  } = {
    foldername: req.body.folder.trim(),
    user_id: (req as IUser).user._id,
    parent_id: returnObjectID(req.params.folder),
    description: "",
    createdOn: new Date(),
    isTrashed: false,
    isFavorited: false,
  };

  // Creates folder
  const createdFolder: any = await createFolder(folder);
  // If folder was created succesfully, return a success response back to client
  if (createdFolder.insertedId.length < 0) {
    return res.status(400).json({
      error: {
        message: "Folder not created",
      },
    });
  }
  return res.status(201).json({
    success: {
      message: "Folder successfully created",
    },
    newFolder: createdFolder.ops,
  });
};

export const renameFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Create JOI Schema
  const schema: ObjectSchema<any> = Joi.object({
    folder: Joi.string().required().messages({
      "string.empty": `Folder cannot be empty.`,
    }),
  });
  // Validate user inputs
  const validation: ValidationResult = await schema.validate({
    folder: req.body.newName,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });
  // Updates the folder with the new folder name
  const renamedFolderResult: any = await updateFolders(
    {
      _id: returnObjectID(req.body.id),
    },
    {
      $set: { foldername: req.body.newName.trim() },
    }
  );
  // If the folder was renamed succesfully, send a success response back to the client
  if (renamedFolderResult.result.nModified === 1) {
    return res.json({
      sucess: {
        message: "Folder was renamed successfully.",
      },
    });
  }
  return res.status(400).json({
    error: {
      message: "Folder was not renamed succesfully",
    },
  });
};

export const deleteFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Folders represent an array of folders that will be permanently deleted
  const folders: (string | ObjectID)[] = generateFolderArray(req);
  if (folders.length === 0) return;

  // Find the files that are in the specified folder
  const files: any = await findFiles({
    "metadata.folder_id": { $in: folders },
  });

  // Deletes the files that are in fs.files and fs.chunks
  const deletedFilesPromise: any = files.map(
    async (file: { _id: ObjectID }) => {
      await Connection.gfs.delete(file._id);
    }
  );

  return Promise.all(deletedFilesPromise).then(async () => {
    // Delete all the selected folders
    const deletedFoldersResult = await deleteFolder({
      _id: { $in: folders },
    });
    // If the folders were moved successfully, return a success response back to the client
    if (deletedFoldersResult.deletedCount > 0) return;
  });
};

export const trashFolders = async (req: Request): Promise<any> => {
  const folders: (string | ObjectID)[] = generateFolderArray(req);
  if (folders.length === 0) return;
  let trashedFolders: any = await updateFolders(
    {
      _id: { $in: folders },
    },
    {
      $set: { isTrashed: true, trashedAt: new Date(), isFavorited: false },
    }
  );

  if (trashedFolders.result.nModified > 0) return;
};

export const restoreFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Folders represent an array of folders that will be restored from the trash
  const folders: (string | ObjectID)[] = generateFolderArray(req);
  if (folders.length === 0) return;

  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */

  const restoredFolders: any = await updateFolders(
    { user_id: (req as IUser).user._id, _id: { $in: folders } },
    { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
  );
  if (restoredFolders.result.nModified > 0) {
    // Restore the files
    const restoredFiles: any = await updateFiles(
      {
        "metadata.user_id": (req as IUser).user._id,
        "metadata.folder_id": { $in: folders },
      },
      { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
    );

    // If files are restored succesfully, return a sucess response back to the client
    if (restoredFiles.result.nModified >= 0) return;
  }
};

export const undoTrashFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Folders represent an array of folders that will be restored from the trash
  const folders: (string | ObjectID)[] = generateFolderArray(req);
  if (folders.length === 0) return;

  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */

  const restoredFolders: any = await updateFolders(
    { user_id: (req as IUser).user._id, _id: { $in: folders } },
    { $unset: { trashedAt: "" }, $set: { isTrashed: false } }
  );
  if (restoredFolders.result.nModified > 0) {
    // Restore the files
    const restoredFiles: any = await updateFiles(
      {
        "metadata.user_id": (req as IUser).user._id,
        "metadata.folder_id": { $in: folders },
      },
      { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
    );

    // If files are restored succesfully, return a sucess response back to the client
    if (restoredFiles.result.nModified >= 0) {
      return;
    }
  }
};

export const favoriteFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Folders represent an array of folders that will be favorited
  const folders: (string | ObjectID)[] = generateFolderArray(req);
  if (folders.length === 0) return;
  // Favorites the selected folders
  const favoritedFolders: any = await updateFolders(
    { _id: { $in: folders } },
    { $set: { isFavorited: true } }
  );
  // If folders were succesfully favorited, return a success response back to the client

  if (favoritedFolders.result.nModified > 0) return;
};

export const unfavoriteFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Folders represent an array of folders that will be unfavorited
  const folders: (string | ObjectID)[] = generateFolderArray(req);
  if (folders.length === 0) return;

  // Unfavorites the selected folder
  const unfavoritedFolders: any = await updateFolders(
    { _id: { $in: folders } },
    { $set: { isFavorited: false } }
  );

  // If the folders were unfavorited, return a success response back to the client
  if (unfavoritedFolders.result.nModified > 0) return;
};

export const undoFavoriteFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Folders represent an array of folders that will be unfavorited
  const folders: (string | ObjectID)[] = generateFolderArray(req);
  if (folders.length === 0) return;

  // Unfavorites the selected folder
  const unfavoritedFolders: any = await updateFolders(
    { _id: { $in: folders } },
    { $set: { isFavorited: false } }
  );

  // If the folders were unfavorited, return a success response back to the client
  if (unfavoritedFolders.result.nModified > 0) return;
};

export const moveFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const folders: (string | ObjectID)[] = generateFolderArray(req);
  if (folders.length > 0) {
    await updateFolders(
      {
        _id: { $in: folders },
      },
      {
        $set: {
          parent_id: returnObjectID(req.body.moveFolder),
        },
      }
    );
    return;
  }
};

export const homeUnfavoriteFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Folders represent an array of folders that will be unfavorited
  const folders = generateFolderArray(req);
  if (folders.length === 0) return;

  // Unfavorites the selected folder
  const unfavoritedFolders = await updateFolders(
    { _id: { $in: folders } },
    { $set: { isFavorited: false } }
  );

  // If the folders were unfavorited, return a success response back to the client
  if (unfavoritedFolders.result.nModified > 0) return;
};
