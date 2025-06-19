import crypto from "crypto";
import config from "../config.js";

const SECRET_KEY = crypto.createHash("sha256").update(String(config.SECRET_KEY)).digest();
const IV_LENGTH = config.IV_LENGTH;

function encrypt({ text }) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    return {
        iv: iv.toString("base64"),
        content: encrypted,
    };
}

function decrypt(encrypted) {
    const iv = Buffer.from(encrypted.iv, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted.content, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

export { encrypt, decrypt };
