import express from "express";
import path from "path";

import { errorHandler } from "./middlewares/errorhandling";
import { verifyToken } from "./middlewares/verifyToken";
import abilitiesRouter from "./routes/abilities";
import authRouter from "./routes/auth";
import userAbilitiesRouter from "./routes/userAbilities";
import jobsRouter from "./routes/jobs";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const whitelist = ["/api/v1/users", "/api/v1/users/login"];
app.use("/api/v1/", (req, res, next) => {
  if (whitelist.includes(req.originalUrl)) {
    return next();
  }
  verifyToken(req, res, next);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use("/api/v1/users", authRouter);
app.use("/api/v1/abilities", abilitiesRouter);
app.use("/api/v1/users/abilities", userAbilitiesRouter);
app.use("/api/v1/jobs", jobsRouter);


app.use(errorHandler);
