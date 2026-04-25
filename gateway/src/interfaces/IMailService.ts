export interface IMailService {
  sendConfirmationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  send2FACode(email: string, code: string): Promise<void>;
}
