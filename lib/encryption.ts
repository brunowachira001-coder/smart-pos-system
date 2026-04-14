import crypto from 'crypto';
import { config } from './config';

const algorithm = 'aes-256-gcm';
const keyLength = 32;
const saltLength = 16;
const tagLength = 16;
const ivLength = 12;

export const encryption = {
  encrypt: (plaintext: string): string => {
    try {
      const key = Buffer.from(config.encryption.key, 'utf-8').slice(0, keyLength);
      const iv = crypto.randomBytes(ivLength);
      const cipher = crypto.createCipheriv(algorithm, key, iv);

      let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();
      const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

      return result;
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  },

  decrypt: (ciphertext: string): string => {
    try {
      const key = Buffer.from(config.encryption.key, 'utf-8').slice(0, keyLength);
      const parts = ciphertext.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid ciphertext format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  },

  hash: (plaintext: string): string => {
    return crypto.createHash('sha256').update(plaintext).digest('hex');
  },

  hashPassword: (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  },

  verifyPassword: (password: string, hash: string): boolean => {
    const [salt, storedHash] = hash.split(':');
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return computedHash === storedHash;
  },
};

export default encryption;
