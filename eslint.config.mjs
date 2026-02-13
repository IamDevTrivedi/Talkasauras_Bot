// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    {
        ignores: ["node_modules/**", "build/**", "*.config.*"],
    },
    {
        files: ["**/*.ts", "**/*.js", "**/*.mjs", "**/*.cjs"],
        extends: [eslint.configs.recommended, tseslint.configs.recommended],
    }
);
