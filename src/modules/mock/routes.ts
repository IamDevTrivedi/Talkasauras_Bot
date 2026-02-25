import express, { Router } from "express";
import { controller } from "./controller.js";

const router: Router = express.Router();

router.get("/api/tags", controller.tags);
router.post("/api/generate", controller.generate);
router.post("/api/chat", controller.chat);

router.get("/", (req, res) => {
    res.send("Ollama is running");
});

router.use("/api", (req, res) => {
    res.status(404).json({
        error: "endpoint not found",
    });
});

export default router;
