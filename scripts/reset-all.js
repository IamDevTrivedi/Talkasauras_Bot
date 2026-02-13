// scripts/reset-all.js: standalone script to clean and reinstall dependencies in all relevant directories

import { execSync } from "child_process";
import process from "process";
import console from "console";

try {
    execSync("node scripts/clean-all.js", { stdio: "inherit" });
} catch (error) {
    console.error("Clean step failed:", error.message);
    process.exit(1);
}

try {
    execSync("node scripts/install-all.js", { stdio: "inherit" });
} catch (error) {
    console.error("Install step failed:", error.message);
    process.exit(1);
}
