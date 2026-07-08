import { prisma } from "@/db/prisma.js";
import { decrypt } from "@/utils/crypto.js";
import { env } from "@/config/env.js";

const getUser = async (telegramIdHash: string) => {
    return prisma.user.findUnique({
        where: { telegramIdHash },
    });
};

const decryptCustomInstructions = (encrypted: string | null): string | undefined => {
    if (!encrypted) return undefined;

    return decrypt({
        data: encrypted,
        key: env.KEYS.SECRET_KEY_2,
    });
};

export { getUser, decryptCustomInstructions };
