import nodemailer from 'nodemailer';
import { Logger } from '../common/logger';

export class MailService {
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

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Confirmez votre email - Cyna',
        html: `
          <h1>Bienvenue sur Cyna !</h1>
          <p>Cliquez sur le lien ci-dessous pour confirmer votre email :</p>
          <a href="${confirmUrl}">Confirmer mon email</a>
          <p>Ou copiez-collez ce lien : ${confirmUrl}</p>
          <p>Ce lien expire dans 24h.</p>
        `,
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

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Réinitialiser votre mot de passe - Cyna',
        html: `
          <h1>Réinitialisation de mot de passe</h1>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
          <p>Ou copiez-collez ce lien : ${resetUrl}</p>
          <p>Ce lien expire dans 1h.</p>
        `,
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
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Votre code de vérification - Cyna',
        html: `
          <h1>Code de vérification</h1>
          <p>Votre code de vérification est :</p>
          <h2 style="font-size: 32px; letter-spacing: 5px; font-weight: bold;">${code}</h2>
          <p>Ce code expire dans 5 minutes.</p>
          <p>Ne partagez ce code avec personne.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      Logger.info(`Code 2FA envoyé à ${email}`);
    } catch (error) {
      Logger.error('Erreur envoi code 2FA:', error);
      throw error;
    }
  }
}