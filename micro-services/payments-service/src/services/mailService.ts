import nodemailer from 'nodemailer';
import { Logger } from '../common/logger';
import emailTemplates from '../templates/emailTemplates';
import { IMailService } from '../interfaces/IMailService';
import { IOrderConfirmationDetails } from '../interfaces/IOrderConfirmationDetails';

export class MailService implements IMailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendConfirmationEmail(email: string, token: string) {
    try {
      const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
      const template = emailTemplates.fr.confirmEmail;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html(confirmUrl),
      });

      Logger.info(`Email de confirmation envoyé à ${email}`);
    } catch (error) {
      Logger.error('Erreur envoi email confirmation:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      const template = emailTemplates.fr.resetPassword;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html(resetUrl),
      });

      Logger.info(`Email de reset envoyé à ${email}`);
    } catch (error) {
      Logger.error('Erreur envoi email reset:', error);
      throw error;
    }
  }

  async send2FACode(email: string, code: string) {
    try {
      const template = emailTemplates.fr.twoFactorCode;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html(code),
      });

      Logger.info(`Code 2FA envoyé à ${email}`);
    } catch (error) {
      Logger.error('Erreur envoi code 2FA:', error);
      throw error;
    }
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
