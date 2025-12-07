import NodeCache from "node-cache";

export const userCache = new NodeCache({ stdTTL: 3600 });
