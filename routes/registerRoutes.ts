import { checkNotAuthenticated } from "../middlewares/requireLogin";
import {
  register,
  confirmUser,
  resendVerificationEmail,
} from "../controllers/registerUserController";
import passport from "passport";
import { asyncHandler } from "../services/asyncHandler";
import { Request, Response, NextFunction, Application } from "express";

/**
 * This module focuses on the endpoints related to registering a user, logging in the user, and resending email verifications.
 * @param {*} app
 */
module.exports = (app: Application) => {
  // @route POST - Registers a user if they are not authenticated.
  app.post("/api/users/registration", checkNotAuthenticated, register);

  // @route GET - Verifies the user's email if they provide the token that is sent to their email.
  app.get("/registration-confirmation", confirmUser);

  // @route POST - Resends an confirmation email to user if they did not their confirm their account.
  app.post("/api/users/confirmation", asyncHandler(resendVerificationEmail));

  // @route POST - Logs in the user if they are not authenticated and provide the proper credentials.
  app.post(
    "/api/users/login",
    checkNotAuthenticated,
    (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) next(err);
        if (!user)
          return res
            .status(401)
            .json({ error: { message: "Unable to login" } });
        req.login(user, (err) => {
          if (err) next(err);
          return res.json({ success: { message: "Logged in succesfully" } });
        });
        return;
      })(req, res, next);
    }
  );

  // @route POST - Logout
  app.post("/logout", (req: Request, res: Response) => {
    (req as any).session.destroy();
    res.json({ success: { message: "Succesfully logged out" } });
  });
};
