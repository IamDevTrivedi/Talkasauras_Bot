import { checkEnv } from "@config/checkEnv";

const init = async () => {
    checkEnv();
};

init().catch(console.error);
