import { env } from "@/config/env";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]),
    PORT: z.int().min(3000).max(5050),
});

export const checkEnv = () => {
    const result = envSchema.safeParse(env);

    if (!result.success) {
        console.error("Environment variable validation failed:", z.treeifyError(result.error));
        process.exit(1);
    } else {
        console.log("Environment variables validated successfully.");
    }
};

export type EnvSchema = z.infer<typeof envSchema>;
