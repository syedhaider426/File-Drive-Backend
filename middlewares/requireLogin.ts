import { Request, Response, NextFunction } from "express";
// Middleware that exports two functions which determine if the user is logged in

// Checks if the user is authenticated
export const checkAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //If user is not authenticated, call next to pass control to next middleware; else, take user to root page of website
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    error: {
      message: "You are not authorized to view this page.",
    },
  });
};
// Checks if the user is not authenticated
export const checkNotAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //If the user is authenticated, take user to their home page; ; else, call next to pass control to next middleware
  if (req.isAuthenticated()) {
    return res.json({
      loggedIn: {
        message: "You are already logged in.",
      },
    });
  }
  next();
  return;
};
