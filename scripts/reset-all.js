import { execSync } from "child_process";

execSync("bun scripts/clean-all.js", { stdio: "pipe" });
execSync("bun scripts/install-all.js", { stdio: "pipe" });
