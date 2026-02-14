import { Request, Response } from "express"

export const controller = {
    index: async (req: Request, res: Response) => {
        return res.json({
            success: true,
            message: "Welcome to the Talkasauras Bot API!",
        })
    }
}