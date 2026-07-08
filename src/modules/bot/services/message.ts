import { prisma } from "@/db/prisma.js";
import { decrypt, encrypt } from "@/utils/crypto.js";
import { env } from "@/config/env.js";

const getHistory = async (telegramIdHash: string, isTemporary: boolean) => {
    const prevMsgs = await prisma.message.findMany({
        where: {
            telegramIdHash,
            isTemporary,
        },
        select: {
            role: true,
            content: true,
        },
    });

    return prevMsgs.map((msg) => ({
        role: msg.role,
        content: decrypt({
            data: msg.content,
            key: env.KEYS.SECRET_KEY_2,
        }),
    }));
};

const saveMessage = async (
    telegramIdHash: string,
    content: string,
    role: "user" | "assistant",
    isTemporary: boolean
) => {
    return prisma.message.create({
        data: {
            telegramIdHash,
            content: encrypt({ data: content, key: env.KEYS.SECRET_KEY_2 }),
            role,
            createdAt: BigInt(Date.now()),
            isTemporary,
        },
    });
};

export { getHistory, saveMessage };
