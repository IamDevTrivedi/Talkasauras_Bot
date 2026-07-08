import { prisma } from "@/db/prisma.js";
import { encrypt } from "@/utils/crypto.js";
import { env } from "@/config/env.js";
import { reminderQueue, QueueNames } from "../../queue/index.js";

const createReminder = async (
    telegramIdHash: string,
    telegramIdEnc: string,
    noteText: string,
    scheduledDate: Date
) => {
    const encryptedMessage = encrypt({
        key: env.KEYS.SECRET_KEY_2,
        data: noteText,
    });

    const delay = scheduledDate.getTime() - Date.now();

    const reminder = await prisma.reminder.create({
        data: {
            telegramIdHash,
            telegramIdEnc,
            message: encryptedMessage,
            remindAt: BigInt(scheduledDate.getTime()),
            createdAt: BigInt(Date.now()),
        },
    });

    if (delay > 0) {
        await reminderQueue.add(QueueNames.SEND_REMINDER, { reminderId: reminder.id }, { delay });
    }

    return reminder;
};

export { createReminder };
