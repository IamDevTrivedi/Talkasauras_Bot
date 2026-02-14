import { Request, Response } from "express";

export const controller = {
    index: async (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "Service is healthy",
        });
    },
};
