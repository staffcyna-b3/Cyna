import nodemailer from 'nodemailer';
import { Logger } from '../common/logger';
import emailTemplates from '../templates/emailTemplates';
import { IMailService } from '../interfaces/IMailService';
import { IOrderConfirmationDetails } from '../interfaces/IOrderConfirmationDetails';

export class MailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
      throw new Error('EMAIL_USER et EMAIL_PASSWORD doivent être définis');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendOrderConfirmationEmail(email: string, details: IOrderConfirmationDetails) {
    try {
      const template = emailTemplates.fr.orderConfirmation;
      const amount = (details.amountCents / 100).toFixed(2);

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html(amount, details.currency, details.paymentIntentId),
      });

      Logger.info(`Email de confirmation de commande envoyé à ${email}`);
    } catch (error) {
      Logger.error('Erreur envoi email confirmation de commande:', error);
      throw error;
    }
  }
}
