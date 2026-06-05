import { execSync } from "child_process";

execSync("node scripts/clean-all.js", { stdio: "pipe" });
execSync("node scripts/install-all.js", { stdio: "pipe" });
