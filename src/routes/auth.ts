import express from "express";

import {
  loginUser,
  registerUser,
  saveUserDocuments,
} from "../controllers/auth";

const authRouter = express.Router();

authRouter.post("/", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/documents", saveUserDocuments);

export default authRouter;
