import express, { Router } from "express";
import { controller } from "./controller.js";

const router: Router = express.Router();

router.get("/", controller.index);

export default router;
