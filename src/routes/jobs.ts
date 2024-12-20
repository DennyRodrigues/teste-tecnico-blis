import { findJobsForUser } from "@/controllers/jobs";
import express from "express";

const jobsRouter = express.Router();

jobsRouter.get("/user", findJobsForUser);

export default jobsRouter;
