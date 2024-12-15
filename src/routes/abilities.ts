import express from "express";

import { createAbilities, updateAbilities } from "../controllers/abilities";
const abilitiesRouter = express.Router();

abilitiesRouter.post("/", createAbilities);
abilitiesRouter.put("/", updateAbilities);

export default abilitiesRouter;
