import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    email: string,
    userId: string,
   };
}
