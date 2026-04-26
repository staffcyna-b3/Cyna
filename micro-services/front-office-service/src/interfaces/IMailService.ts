export interface IMailService {
  sendContactNotification(data: {
    fromEmail: string;
    subject: string;
    message: string;
  }): Promise<void>;
}
