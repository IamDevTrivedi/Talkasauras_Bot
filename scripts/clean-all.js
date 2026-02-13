// scripts/clean-all.js: standalone script to clean build and node_modules directories

import fs from "fs";

const dirs = ["./build", "./node_modules"];

dirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
