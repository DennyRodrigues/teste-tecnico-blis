/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { ErrorRequestHandler } from "express";
import Joi from "joi";
import { JsonWebTokenError } from "jsonwebtoken";

export const errorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response
): void => {
  console.log("res:", res);
  console.error("Error:", error);

  // Handle JOI validation errors
  if (error instanceof Joi.ValidationError) {
    res.status(400).json({
      message: "Validation error",
      details: error.details.map((err) => err.message),
    });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(400).json({
      message: "Bad JSON format",
      details: "The JSON sent in the request body is malformed.",
    });
    return;
  }
  // Handle known Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = error.code === "P2002" ? 409 : 400; // Example: Unique constraint violation
    res.status(statusCode).json({
      message: `Database error: ${error.message}`,
    });
    return;
  }

  // Handle Json Web Token Error
  if (error instanceof JsonWebTokenError) {
    res.status(403).json({
      message: "Invalid token",
    });
    return;
  }

  // Fallback for unknown errors
  res.status(500).json({
    message: "An unexpected error occurred.",
  });
};
