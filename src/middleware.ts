import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export interface ExtendedUserId extends Request {
  userId: string;
}

export const userMiddleware = async (
  req: ExtendedUserId,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const decodedUser = jwt.verify(header!, JWT_SECRET!);

  if (decodedUser) {
    // @ts-ignore
    req.userId = decodedUser.id;
    next();
  } else {
    res.status(403).json({
      message: "User not logged in",
    })
  }
};
