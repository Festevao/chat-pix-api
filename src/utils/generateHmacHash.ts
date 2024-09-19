import * as crypto from 'crypto';

export const generateHMAC = (key: string, message: string) => {
  return crypto.createHmac('sha256', key).update(message).digest('hex');
}