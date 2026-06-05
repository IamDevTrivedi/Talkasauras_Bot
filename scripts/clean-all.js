import { rmSync, existsSync } from "fs";

const dirs = ["./dist", "./node_modules"];

for (const dir of dirs) {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
    }
}
