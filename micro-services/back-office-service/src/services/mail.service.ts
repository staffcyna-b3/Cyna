import nodemailer from 'nodemailer';
import { Logger } from '../common/logger';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
      Logger.warn('EMAIL_USER / EMAIL_PASSWORD non configurés — envoi désactivé');
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendReply(options: {
    to: string;
    subject: string;
    replyMessage: string;
    originalMessage: string;
  }): Promise<void> {
    if (!this.transporter) {
      Logger.warn('MailService non configuré — reply non envoyé');
      return;
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px;">
        <p>${options.replyMessage.replace(/\n/g, '<br/>')}</p>
        <hr style="margin: 24px 0; border-color: #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 13px;">
          Message original :<br/>
          ${options.originalMessage.replace(/\n/g, '<br/>')}
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Cyna — secure your future
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `Cyna Support <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject.startsWith('Re:')
        ? options.subject
        : `Re: ${options.subject}`,
      html,
    });
  }
}
