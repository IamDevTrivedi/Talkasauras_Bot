import crypto from "crypto";

export interface HMACOptions {
    key: string;
    data: string;
}

export const HMAC = (options: HMACOptions) => {
    const hmac = crypto.createHmac("sha256", options.key);
    hmac.update(options.data);
    return hmac.digest("hex");
};

export interface EncryptOptions {
    key: string;
    data: string;
}

export const encrypt = (options: EncryptOptions): string => {
    const iv = crypto.randomBytes(12);
    const key = crypto.createHash("sha256").update(options.key).digest();
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(options.data, "utf8"),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

export interface DecryptOptions {
    key: string;
    data: string;
}

export const decrypt = (options: DecryptOptions): string => {
    const buffer = Buffer.from(options.data, "base64");
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const key = crypto.createHash("sha256").update(options.key).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ]);
    return decrypted.toString("utf8");
};
