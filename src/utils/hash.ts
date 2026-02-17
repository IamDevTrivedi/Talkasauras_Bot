import crypto from "crypto";

export interface HMACPayload {
    key: string;
    data: string;
}

export const HMAC = (payload: HMACPayload) => {
    const hmac = crypto.createHmac("sha256", payload.key);
    hmac.update(payload.data);
    return hmac.digest("hex");
};
