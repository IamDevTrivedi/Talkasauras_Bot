// scripts/install-all.js: standalone script to install dependencies in all relevant directories

import { exec } from "child_process";
import console from "console";

const dirs = ["./"];

dirs.forEach((dir) => {
    exec("pnpm install", { cwd: dir }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error installing dependencies in ${dir}:`, error);
            return;
        }
        if (stderr) {
            console.error(`Errors during installation in ${dir}:\n${stderr}`);
        }
    });
});
