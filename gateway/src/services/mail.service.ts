import nodemailer from 'nodemailer';
import { Logger } from '../common/logger';
import emailTemplates from '../templates/emailTemplates';
import { IMailService } from '../interfaces';

export class MailService implements IMailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail', // ou autre service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Utilise un "App Password" pour Gmail
    },
  });

  async sendConfirmationEmail(email: string, token: string) {
    try {
      const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
      const template = emailTemplates.fr.confirmEmail;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html(confirmUrl),
      };

      await this.transporter.sendMail(mailOptions);
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

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html(resetUrl),
      };

      await this.transporter.sendMail(mailOptions);
      Logger.info(`Email de reset envoyé à ${email}`);
    } catch (error) {
      Logger.error('Erreur envoi email reset:', error);
      throw error;
    }
  }

  async send2FACode(email: string, code: string) {
    try {
      const template = emailTemplates.fr.twoFactorCode;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: template.subject,
        html: template.html(code),
      };

      await this.transporter.sendMail(mailOptions);
      Logger.info(`Code 2FA envoyé à ${email}`);
    } catch (error) {
      Logger.error('Erreur envoi code 2FA:', error);
      throw error;
    }
  }
}