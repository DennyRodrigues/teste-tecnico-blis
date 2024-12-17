import express from "express";

import {
  createUserAbilities,
  getUserAbilities,
  deleteUserAbilities,
} from "../controllers/userAbilities";
const userAbilitiesRouter = express.Router();

userAbilitiesRouter.post("/", createUserAbilities);
userAbilitiesRouter.delete("/", deleteUserAbilities);
userAbilitiesRouter.get("/", getUserAbilities);

export default userAbilitiesRouter;
