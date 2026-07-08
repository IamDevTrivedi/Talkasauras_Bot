import { WritingStyle } from "@prisma/client";

export const writingStyleLabels: Record<WritingStyle, string> = {
    DEFAULT: "Default",
    FORMAL: "Formal",
    DESCRIPTIVE: "Descriptive",
    CONCISE: "Concise",
};
