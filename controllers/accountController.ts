// const Connection = require("../database/Connection");
import returnObjectID from "../database/returnObjectID";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi, { ObjectSchema, ValidationResult } from "@hapi/joi";
import { keys } from "../config/keys";
import sgMail from "@sendgrid/mail";
import Connection from "../database/Connection";
import { Request, Response, NextFunction } from "express";
import { Collection } from "mongodb";

interface IUser extends Request {
  user: { _id: string };
}

export const getUserByEmail = async (email: string) => {
  const result = await Connection.db
    .collection("users")
    .findOne({ email: email });
  return result;
};

export const getUserById = async (id: string) => {
  return await Connection.db
    .collection("users")
    .findOne({ _id: returnObjectID(id) });
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Create JOI Schema
  const schema: ObjectSchema<any> = Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": `Password cannot be empty.`,
    }),
    newPassword: Joi.string().required().messages({
      "string.empty": `Password cannot be empty.`,
    }),
    confirmPassword: Joi.valid(Joi.ref("newPassword")).messages({
      "any.only": `Confirmed password does not match entered password`,
    }),
  });

  // Validate user inputs
  const validation: ValidationResult = await schema.validate(
    {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    },
    { abortEarly: false }
  );

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    const users: Collection<any> = Connection.db.collection("users");
    // Finds current user's password
    const user: { [key: string]: any; password: "" } = await users.findOne({
      _id: (req as IUser).user._id,
    });

    // Compare hash against current user's password
    const passwordVerified: boolean = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );

    if (!passwordVerified)
      return res.status(400).json({
        error: {
          message: "Password entered does not match current password",
        },
      });

    // Hash the new password
    const hash: string = await bcrypt.hash(req.body.newPassword, 10);
    await users.updateOne({ _id: user._id }, { $set: { password: hash } });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error resetting your password. Please try again.",
        },
      });
    else next(err);
  }
  return res.status(200).json({
    success: {
      message: "Password has been successfully changed. Please sign out.",
    },
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Create JOI schema
  const schema: ObjectSchema<any> = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": `Email cannot be empty.`,
      "string.email": `Please provide a proper email address.`,
    }),
  });

  // Validate user inputs
  const validation: ValidationResult = await schema.validate({
    email: req.body.email,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    // Gets user's id
    const user: { [key: string]: any } = await Connection.db
      .collection("users")
      .findOne({ email: req.body.email });

    // Stores id in token
    const token: string = await jwt.sign({ id: user._id }, keys.jwtPrivateKey, {
      expiresIn: "1h",
    });

    let url: string = "http://localhost:3000";
    if (process.env.NODE_ENV === "production") url = "https://file-drive.xyz";

    // Set mail content for SendGrid to send
    let mailOptions: {
      from: string;
      to: string;
      subject: string;
      text: string;
    } = {
      from: keys.email,
      to: req.body.email,
      subject: "Forgotten Password - F-Drive",
      text:
        "Hello,\n\n" +
        `Please reset your password by clicking the link: \n${url}` +
        "/newPassword?token=" +
        token +
        "\n",
    };
    sgMail.setApiKey(keys.sendgrid_api_key);
    // Send email via SendGrid
    await sgMail.send(mailOptions);
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an issue sending a reset password email. Please try again.",
        },
      });
    else next(err);
  }

  // Return success status back to client
  return res.status(200).json({
    success: {
      message: "Please check your email to reset your password.",
    },
  });
};

export const newPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Create JOI schema
  const schema: Joi.ObjectSchema<any> = Joi.object({
    password: Joi.string().required().messages({
      "string.empty": `Password cannot be empty.`,
    }),
    repeat_password: Joi.valid(Joi.ref("password")).messages({
      "any.only": `Confirmed password does not match entered password`,
    }),
  });
  // Validate user inputs
  const validation: Joi.ValidationResult = await schema.validate({
    password: req.body.password,
    repeat_password: req.body.confirmPassword,
  });

  // Return error if any inputs do not satisfy the schema
  if (validation.error)
    return res.status(400).json({
      error: {
        message: validation.error,
      },
    });

  try {
    const user = (await jwt.verify(req.body.token, keys.jwtPrivateKey)) as {
      [key: string]: any;
      id: string;
    };
    // Throw error if token expired or is invalid
    if (!user)
      return res.status(400).json({
        error: {
          message:
            "There was an error resetting your password. Please try again.",
        },
      });

    // Hash the new password entered
    const hash: string = await bcrypt.hash(req.body.password, 10);
    await Connection.db
      .collection("users")
      .updateOne({ _id: user.id }, { $set: { password: hash } });
  } catch (err) {
    // If there is an error with Mongo, throw an error
    if (err.name === "MongoError")
      return res.status(404).json({
        error: {
          message:
            "There was an error resetting your password. Please try again.",
        },
      });
    else next(err);
  }
  return res.status(200).json({
    success: {
      message: "Password has been successfully changed. Please log in.",
    },
  });
};
