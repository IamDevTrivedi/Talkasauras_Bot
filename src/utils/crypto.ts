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

export interface GenerateBytes {
    length: number;
}

export const generateBytes = (options: GenerateBytes) => {
    return crypto.randomBytes(options.length);
};

export interface KeyGenOptions {
    masterKey: string;
}

export const generateKey = (options: KeyGenOptions) => {
    const key = crypto.createHash("sha256").update(options.masterKey).digest("hex");
    return key;
};

export interface EncryptOptions {
    key: string;
    data: string;
    nonce: string;
}

export const encrypt = (options: EncryptOptions) => {
    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(options.key, "hex"),
        Buffer.from(options.nonce, "hex")
    );
    let encrypted = cipher.update(options.data, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return `${encrypted}:${tag}`;
};

export interface DecryptOptions {
    key: string;
    data: string;
    nonce: string;
}

export const decrypt = (options: DecryptOptions) => {
    const [encryptedData, tag] = options.data.split(":");
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(options.key, "hex"),
        Buffer.from(options.nonce, "hex")
    );
    decipher.setAuthTag(Buffer.from(tag, "hex"));
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
