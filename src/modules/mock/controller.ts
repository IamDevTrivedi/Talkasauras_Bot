import { Request, Response } from "express";
import { z } from "zod";

const MOCK_RESPONSE =
    "This is a mock response from the dev server. Everything is working correctly!";

const chatMessageSchema = z.object({
    role: z.enum(["system", "user", "assistant", "tool"]),
    content: z.string().min(1),
    images: z.array(z.string()).optional(),
    tool_calls: z
        .array(
            z.object({
                function: z.object({
                    name: z.string(),
                    arguments: z.record(z.string(), z.any()),
                }),
            })
        )
        .optional(),
});

const generateSchema = z.object({
    model: z.string().min(1),
    prompt: z.string().min(1),
    images: z.array(z.string()).optional(),
    format: z.union([z.literal("json"), z.record(z.string(), z.any())]).optional(),
    options: z.record(z.string(), z.any()).optional(),
    system: z.string().optional(),
    template: z.string().optional(),
    context: z.array(z.number()).optional(),
    stream: z.boolean().optional(),
    raw: z.boolean().optional(),
    keep_alive: z.union([z.string(), z.number()]).optional(),
});

const chatSchema = z.object({
    model: z.string().min(1),
    messages: z.array(chatMessageSchema).min(1),
    tools: z
        .array(
            z.object({
                type: z.literal("function"),
                function: z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    parameters: z.record(z.string(), z.any()),
                }),
            })
        )
        .optional(),
    format: z.union([z.literal("json"), z.record(z.string(), z.any())]).optional(),
    options: z.record(z.string(), z.any()).optional(),
    stream: z.boolean().optional(),
    keep_alive: z.union([z.string(), z.number()]).optional(),
});

export const controller = {
    generate: async (req: Request, res: Response) => {
        const result = generateSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: z.treeifyError(result.error),
            });
        }

        const data = result.data;

        return res.status(200).json({
            model: data.model,
            created_at: new Date().toISOString(),
            response: MOCK_RESPONSE,
            done: true,
            done_reason: "stop",
            context: data.context || [],
            total_duration: 5234567890,
            load_duration: 234567890,
            prompt_eval_count: 42,
            prompt_eval_duration: 1234567890,
            eval_count: 87,
            eval_duration: 3765432100,
        });
    },

    chat: async (req: Request, res: Response) => {
        const result = chatSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: z.treeifyError(result.error),
            });
        }

        const data = result.data;

        return res.status(200).json({
            model: data.model,
            created_at: new Date().toISOString(),
            message: {
                role: "assistant",
                content: MOCK_RESPONSE,
            },
            done: true,
            done_reason: "stop",
            total_duration: 5234567890,
            load_duration: 234567890,
            prompt_eval_count: 42,
            prompt_eval_duration: 1234567890,
            eval_count: 87,
            eval_duration: 3765432100,
        });
    },

    tags: async (req: Request, res: Response) => {
        return res.status(200).json({
            models: [
                {
                    name: "llama3.2:latest",
                    model: "llama3.2:latest",
                    modified_at: new Date(Date.now() - 86400000).toISOString(),
                    size: 2019393792,
                    digest: "sha256:a80c4f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b72",
                    details: {
                        parent_model: "",
                        format: "gguf",
                        family: "llama",
                        families: ["llama"],
                        parameter_size: "3.2B",
                        quantization_level: "Q4_0",
                    },
                },
                {
                    name: "gemma3:latest",
                    model: "gemma3:latest",
                    modified_at: new Date(Date.now() - 172800000).toISOString(),
                    size: 4890234123,
                    digest: "sha256:b80c5f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b73",
                    details: {
                        parent_model: "",
                        format: "gguf",
                        family: "gemma",
                        families: ["gemma"],
                        parameter_size: "9B",
                        quantization_level: "Q4_0",
                    },
                },
                {
                    name: "mock-model:latest",
                    model: "mock-model:latest",
                    modified_at: new Date().toISOString(),
                    size: 1234567890,
                    digest: "sha256:mock-digest-abc123",
                    details: {
                        parent_model: "",
                        format: "gguf",
                        family: "mock",
                        families: ["mock"],
                        parameter_size: "7B",
                        quantization_level: "Q4_K_M",
                    },
                },
            ],
        });
    },
};
