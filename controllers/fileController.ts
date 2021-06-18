import { Request, Response, NextFunction } from "express";
import Connection from "../database/Connection";
import formidable from "formidable";
import fs from "fs";
import returnObjectID from "../database/returnObjectID";
import Joi, { ObjectSchema, ValidationResult } from "@hapi/joi";
import { findFiles, updateFiles } from "../services/files";
import { ObjectID, GridFSBucketWriteStream } from "mongodb";

interface IUser extends Request {
  user: { _id: string };
}

const generateFileArray = (req: Request): (string | ObjectID)[] => {
  const files: (string | ObjectID)[] = [];
  if (req.body.selectedFiles !== undefined)
    req.body.selectedFiles.forEach((file: { [key: string]: any }) => {
      let id;
      if (file.id) id = file.id;
      else id = file._id; //only used when deleting all files
      files.push(returnObjectID(id));
    });
  return files;
};

export const viewFile = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // id of file
  const file = await findFiles({ _id: returnObjectID(req.params.file) });
  res.setHeader("Content-Type", file[0].contentType);
  Connection.gfs
    .openDownloadStream(returnObjectID(file[0]._id) as ObjectID)
    .pipe(res);
};

export const uploadFile = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<any> => {
  const options: {
    contentType?: string;
    metadata: {
      user_id: string;
      isTrashed: boolean;
      folder_id: string | ObjectID;
      isFavorited: boolean;
    };
  } = {
    metadata: {
      user_id: (req as IUser).user._id,
      isTrashed: false,
      folder_id: returnObjectID(req.params.folder),
      isFavorited: false,
    },
  };

  //Pass in an array of files
  const form = new formidable.IncomingForm({
    multiples: true,
    maxFileSize: 3000 * 1024 * 1024, //3gb
  });

  //This is necessary to trigger the events
  form.parse(req, async (_err: any, _fields: any, fileList: any) => {
    if (fileList.files.length === undefined) {
      options.contentType = fileList.files.type;
      const writestream = Connection.gfs.openUploadStream(
        fileList.files.name,
        options
      );
      const id: ObjectID = writestream.id as ObjectID;
      fs.createReadStream(fileList.files.path)
        .pipe(writestream)
        .on("finish", async () => {
          const uploadedFiles: any = await findFiles({
            _id: id,
            "metadata.user_id": (req as IUser).user._id,
            "metadata.folder_id": returnObjectID(req.params.folder),
            "metadata.isTrashed": false,
          });
          const allFiles: any = await getFiles(req);
          return res.json({
            success: {
              message: "File uploaded succesfully",
            },
            files: allFiles,
            uploadedFiles,
          });
        });
    } else {
      let promises: Promise<any>[] = [];
      for (let i = 0; i < fileList.files.length; ++i) {
        let promise = new Promise((resolve, reject) => {
          options.contentType = fileList.files[i].type;
          const writeStream = Connection.gfs.openUploadStream(
            fileList.files[i].name,
            options
          );
          const id: ObjectID = writeStream.id as ObjectID;
          fs.createReadStream(fileList.files[i].path)
            .pipe(writeStream)
            .on("error", (err) => {
              reject(err);
            })
            .on("finish", () => {
              resolve(id);
            });
        });
        promises.push(promise);
      }
      const resultArray: Promise<any>[] = [];
      for (const promiseFile of promises) {
        resultArray.push(await promiseFile);
      }
      if (resultArray.length === fileList.files.length) {
        const uploadedFiles: any = await findFiles({
          _id: { $in: resultArray },
          "metadata.user_id": (req as IUser).user._id,
          "metadata.folder_id": returnObjectID(req.params.folder),
          "metadata.isTrashed": false,
        });
        const allFiles: Promise<any> = await getFiles(req);
        return res.json({
          success: {
            message: "Files were uploaded succesfully",
          },
          files: allFiles,
          uploadedFiles,
        });
      } else {
        return res.status(400).json({
          error: {
            message:
              "Files could not be uploaded at this time. Please try again later",
          },
        });
      }
    }
    return;
  });

  // // If an error occurs, return an error response back to the client
  // form.on("error", (err) => {
  //   if (err) next(err);
  // });
};

export const copyFiles = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const files: { _id: string | ObjectID; filename: string }[] = [];
  const filesSelectedLength = req.body.selectedFiles.length;
  // Pushes the files id and name into the 'files' array
  for (let i = 0; i < filesSelectedLength; ++i) {
    files.push({
      _id: returnObjectID(req.body.selectedFiles[i]._id),
      filename: req.body.selectedFiles[i].filename,
    });
  }
  const gfs = Connection.gfs;
  const promises: Promise<any>[] = [];
  /* https://dev.to/cdanielsen/wrap-your-streams-with-promises-for-fun-and-profit-51ka */
  for (let i = 0; i < files.length; ++i) {
    let promise = new Promise((resolve, reject) => {
      const options: {
        metadata: {
          user_id: string | ObjectID;
          isTrashed: boolean;
          folder_id: string | ObjectID;
          isFavorited: boolean;
        };
        contentType: string;
      } = {
        metadata: {
          user_id: (req as IUser).user._id,
          isTrashed: false,
          folder_id: returnObjectID(req.params.folder),
          isFavorited: false,
        },
        contentType: req.body.selectedFiles[i].contentType,
      };
      // Downloads the file from the GridFSBucket
      const downloadStream = gfs.openDownloadStream(
        returnObjectID(files[i]._id) as ObjectID
      );
      // Uploads the file to GridFSBucket
      const writeStream: GridFSBucketWriteStream = gfs.openUploadStream(
        `Copy of ${files[i].filename}`,
        options
      );
      const id: ObjectID = writeStream.id as ObjectID;
      downloadStream
        .pipe(writeStream)
        .on("error", (err) => {
          reject(err);
        })
        .on("finish", () => {
          resolve(id);
        });
    });
    promises.push(promise);
  }
  const resultArray: Promise<any>[] = [];
  for (const promiseFile of promises) {
    resultArray.push(await promiseFile);
  }
  if (resultArray.length === files.length) {
    const files: Promise<any> = await findFiles({ _id: { $in: resultArray } });
    const newFiles: {
      id: Promise<any>[];
    } = { id: resultArray };
    return res.json({
      files,
      newFiles,
      success: {
        message: "Files were sucessfully copied",
      },
    });
  }
  return res.status(400).json({
    error: {
      message: "Files could not be copied at this time. Please try again later",
    },
  });
};

export const getFiles = async (req: Request): Promise<any> => {
  //Return the files for the specific user
  return await findFiles({
    "metadata.user_id": (req as IUser).user._id,
    "metadata.folder_id": returnObjectID(req.params.folder),
    "metadata.isTrashed": false,
  });
};

export const getAllFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  //Return the files for the specific user
  return await findFiles({
    "metadata.user_id": (req as IUser).user._id,
    "metadata.isTrashed": false,
  });
};

export const getTrashFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  //Return the files for the specific user
  return await findFiles({
    "metadata.user_id": (req as IUser).user._id,
    "metadata.isTrashed": true,
  });
};

export const getFavoriteFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  //Return the files for the specific user
  return await findFiles({
    "metadata.user_id": (req as IUser).user._id,
    "metadata.isTrashed": false,
    "metadata.isFavorited": true,
  });
};

export const deleteFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Files represent an array of files that have been selected to be deleted permanently
  const files: (string | ObjectID)[] = generateFileArray(req);
  if (files.length === 0) return;
  const deletedFilesPromise = files.map(async (file: string | ObjectID) => {
    await Connection.gfs.delete(file as ObjectID);
  });
  return Promise.all(deletedFilesPromise)
    .then(async () => {
      return;
    })
    .catch((err) => {
      // If there is an error with Mongo, an error
      if (err.name === "MongoError")
        return res.status(404).json({
          error: {
            message:
              "There was an error deleting the selected file(s)/folder(s). Please try again.",
          },
        });
      next(err);
      return;
    });
};

export const trashFiles = async (req: Request): Promise<any> => {
  const files: (string | ObjectID)[] = generateFileArray(req);
  if (files.length === 0) return;
  /*
   * Trash the files
   * *NOTE*: trashedAt is a new field that gets added to each document. It has an index on it that
   * will expire after 30 days, ther
   * efore, deleting the folder and file
   */
  let trashedFiles: any = await updateFiles(
    { _id: { $in: files } },
    {
      $set: {
        "metadata.isTrashed": true,
        trashedAt: new Date(),
      },
    }
  );
  if (trashedFiles.result.nModified > 0) return;
};

export const restoreFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files: (string | ObjectID)[] = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  if (files.length === 0) return;
  const restoredFiles: any = await updateFiles(
    {
      "metadata.user_id": (req as IUser).user._id,
      _id: { $in: files },
    },
    { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
  );
  if (restoredFiles.result.nModified > 0) return;
};

export const undoTrashFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  // Files represent an array of files that have been selected to be trashed temporarily
  const files: (string | ObjectID)[] = generateFileArray(req);
  /*
   * Restore the folders
   * **NOTE**: trashedAt is a TTL index that expires after 30 days. The field is unset if the file/folder is restored.
   */
  if (files.length === 0) return;
  const restoredFiles: any = await updateFiles(
    {
      "metadata.user_id": (req as IUser).user._id,
      _id: { $in: files },
    },
    { $unset: { trashedAt: "" }, $set: { "metadata.isTrashed": false } }
  );
  if (restoredFiles.result.nModified > 0) return;
};

export const renameFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Create JOI Schema
  const schema: ObjectSchema<any> = Joi.object({
    file: Joi.string().required().messages({
      "string.empty": `File cannot be empty.`,
    }),
  });

  // Validate user inputs
  const validation: ValidationResult = await schema.validate({
    file: req.body.newName,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    // Finds file and renames it
    const renamedFile: any = await Connection.gfs.rename(
      returnObjectID(req.body.id) as ObjectID,
      req.body.newName.trim()
    );
    if (renamedFile === undefined) {
      return res.json({
        success: {
          message: "File was sucessfully renamed",
        },
      });
    }
  } catch (err) {
    // If there is an error with Mongo, an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error renaming the selected file. Please try again.",
        },
      });
    else next(err);
  }
};

export const undoCopy = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Files represent an array of files that have been selected to be deleted permanently
  const files: any = req.body.selectedFiles;
  console.log(files);
  const deletedFilesPromise: any = files.map(
    async (file: string | ObjectID) => {
      await Connection.gfs.delete(returnObjectID(file) as ObjectID);
    }
  );
  Promise.all(deletedFilesPromise)
    .then(() => {
      return res.json({
        error: {
          success: "File did not get copied",
        },
      });
    })
    .catch((err) => {
      // If there is an error with Mongo, throw an error
      if (err.name === "MongoError")
        return res.status(404).json({
          error: {
            message:
              "There was an error deleting the selected file(s)/folder(s). Please try again.",
          },
        });
      next(err);
      return;
    });
};

export const favoriteFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  // Files represent an array of files that have been selected to be favorited
  const files: (string | ObjectID)[] = generateFileArray(req);
  if (files.length === 0) return;
  const favoritedFiles: any = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": true } }
  );
  if (favoritedFiles.result.nModified > 0) return;
};

export const unfavoriteFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  // Files represent an array of files that have been selected to be unfavorited
  const files: (string | ObjectID)[] = generateFileArray(req);
  if (files.length === 0) return;

  const unfavoritedFiles: any = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0) return;
};

export const undoFavoriteFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  // Files represent an array of files that have been selected to be unfavorited
  const files: (string | ObjectID)[] = generateFileArray(req);
  if (files.length === 0) return;

  const unfavoritedFiles: any = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0) {
    return;
  }
};

export const moveFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<any> => {
  // Files represent an array of files that have been selected to be moved to a new location
  const files: (string | ObjectID)[] = generateFileArray(req);
  if (files.length > 0) {
    const movedFiles: any = await updateFiles(
      {
        _id: { $in: files },
      },
      {
        $set: {
          "metadata.folder_id": returnObjectID(req.body.moveFolder),
        },
      }
    );
    if (movedFiles.result.nModified > 0) return;
  }
};

export const homeUnfavoriteFiles = async (
  req: Request,
  _res: Response,
  _next: NextFunction
) => {
  // Files represent an array of files that have been selected to be unfavorited
  const files: (string | ObjectID)[] = generateFileArray(req);
  if (files.length === 0) return;

  const unfavoritedFiles: any = await updateFiles(
    { _id: { $in: files } },
    { $set: { "metadata.isFavorited": false } }
  );
  if (unfavoritedFiles.result.nModified > 0) return;
};
