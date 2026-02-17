import express, { Router } from "express";
import { controller } from "./controller.js";

const router: Router = express.Router();

router.post("/api/generate", controller.generate);
router.post("/api/chat", controller.chat);
router.get("/api/tags", controller.tags);

export default router;
