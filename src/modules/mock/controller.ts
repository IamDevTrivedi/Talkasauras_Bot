import { Request, Response } from "express";
import { z } from "zod";

const MOCK_RESPONSE =
    "This is a mock response from the dev server. Everything is working correctly! 🦕";

const chatMessageSchema = z.object({
    role: z.enum(["system", "user", "assistant"], {
        message: "role must be one of 'system', 'user', or 'assistant'",
    }),
    content: z.string().min(1, "content must be a non-empty string"),
});

const chatSchema = z.object({
    model: z.string().min(1, "model must be a non-empty string"),
    messages: z.array(chatMessageSchema).min(1, "messages must be a non-empty array"),
    stream: z.boolean().optional(),
});

export const controller = {
    generate: async (req: Request, res: Response) => {
        const schema = z.object({
            model: z.string().min(1, "model must be a non-empty string"),
            prompt: z.string().min(1, "prompt must be a non-empty string"),
            stream: z.boolean().optional(),
        });

        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid request body",
                details: result.error.issues,
            });
        }

        return res.status(200).json({
            model: result.data.model,
            created_at: new Date().toISOString(),
            response: MOCK_RESPONSE,
            done: true,
            done_reason: "stop",
            context: [],
            total_duration: 123456789,
            load_duration: 1234567,
            prompt_eval_count: 10,
            prompt_eval_duration: 12345678,
            eval_count: 20,
            eval_duration: 98765432,
        });
    },

    chat: async (req: Request, res: Response) => {
        const result = chatSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: "Invalid request body",
                details: result.error.issues,
            });
        }

        return res.status(200).json({
            model: result.data.model,
            created_at: new Date().toISOString(),
            message: {
                role: "assistant",
                content: MOCK_RESPONSE,
            },
            done: true,
            done_reason: "stop",
            total_duration: 123456789,
            load_duration: 1234567,
            prompt_eval_count: 10,
            prompt_eval_duration: 12345678,
            eval_count: 20,
            eval_duration: 98765432,
        });
    },

    tags: async (req: Request, res: Response) => {
        return res.status(200).json({
            models: [
                {
                    name: "mock-model:latest",
                    model: "mock-model:latest",
                    modified_at: new Date().toISOString(),
                    size: 0,
                    digest: "mock-digest-abc123",
                    details: {
                        parent_model: "",
                        format: "mock",
                        family: "mock",
                        parameter_size: "0B",
                        quantization_level: "none",
                    },
                },
            ],
        });
    },
};
