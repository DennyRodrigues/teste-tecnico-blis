import { NextFunction, Request,Response } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log(decoded);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      message: "Token is not valid",
    });
  }
};
