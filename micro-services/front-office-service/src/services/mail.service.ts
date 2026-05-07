import nodemailer from 'nodemailer';
import { Logger } from '../common/logger';
import emailTemplates from '../templates/emailTemplates';
import { IMailService } from '../interfaces/IMailService';

export class MailService implements IMailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendContactNotification(data: {
    fromEmail: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const user = process.env.EMAIL_USER;
    const adminEmail = process.env.ADMIN_EMAIL || user;

    if (!user || !adminEmail) {
      Logger.warn('EMAIL_USER / ADMIN_EMAIL non configurés — email de contact non envoyé');
      return;
    }

    try {
      const template = emailTemplates.fr.contactNotification;

      await this.transporter.sendMail({
        from: user,
        to: adminEmail,
        subject: template.subject(data.subject),
        html: template.html(data.fromEmail, data.subject, data.message),
      });

      Logger.info(`Email de contact transmis à l'admin depuis ${data.fromEmail}`);
    } catch (error) {
      Logger.error('Erreur envoi email contact:', error);
      throw error;
    }
  }
}
