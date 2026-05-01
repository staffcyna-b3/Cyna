export interface IMailService {
  sendReply(options: {
    to: string;
    subject: string;
    replyMessage: string;
    originalMessage: string;
  }): Promise<void>;
}
