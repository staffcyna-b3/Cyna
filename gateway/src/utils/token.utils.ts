import crypto from 'crypto';

export const hashToken = (rawToken: string): string => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

export const verifyToken = (rawToken: string, storedHash: string): boolean => {
  return hashToken(rawToken) === storedHash;
};
