import { prisma } from "@/db/prisma.js";

const getFeedbackStats = async () => {
    const [total, unreviewed] = await Promise.all([
        prisma.feedback.count(),
        prisma.feedback.count({ where: { reviewed: false } }),
    ]);

    return { total, unreviewed };
};

const getUnreviewedFeedback = async (limit: number) => {
    return prisma.feedback.findMany({
        where: { reviewed: false },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
            id: true,
            feedback: true,
            createdAt: true,
        },
    });
};

const markFeedbackAsReviewed = async (feedbackId: number) => {
    return prisma.feedback.updateMany({
        where: {
            id: feedbackId,
            reviewed: false,
        },
        data: {
            reviewed: true,
        },
    });
};

export { getFeedbackStats, getUnreviewedFeedback, markFeedbackAsReviewed };
