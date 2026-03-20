import { Request, Response } from 'express';
import { Logger } from '../common/logger';
import { IAuthService } from '../interfaces';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  async login(req: Request, res: Response) {
    try {
      const { email, password, remember_me } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
      }

      const result = await this.authService.login(email, password, remember_me);

      if (!result) {
        return res.status(500).json({ error: 'Erreur lors de la connexion' });
      }

      // Retourner SEULEMENT le sessionId (pas d'infos utilisateur)
      res.status(200).json({
        sessionId: result.sessionId,
        requires2FA: result.requires2FA,
        message: 'Code 2FA envoyé par email',
      });
    } catch (error) {
      Logger.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Erreur login';
      const status = message.includes('non confirmé') ? 403 : 401;
      res.status(status).json({ error: message });
    }
  }

  async verify2FA(req: Request, res: Response) {
    try {
      const { session_id, code } = req.body;

      if (!session_id || !code) {
        return res.status(400).json({ error: 'Données manquantes' });
      }

      // Passer le sessionId au service (pas l'userId)
      const result = await this.authService.verify2FA(session_id, code);

      if (!result) {
        return res.status(500).json({ error: 'Erreur vérification 2FA' });
      }

      // Envoyer le remember token en cookie SI présent
      if (result.rememberToken) {
        res.cookie('remember_me_token', result.rememberToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        });
      }

      res.status(200).json({
        id: result.id,
        email: result.email,
        full_name: result.full_name,
        email_verified: result.email_verified,
        role: result.role,
      });
    } catch (error) {
      Logger.error('Verify 2FA error:', error);
      const message = error instanceof Error ? error.message : 'Erreur vérification';
      res.status(400).json({ error: message });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Données manquantes' });
      }

      const result = await this.authService.register(email, password, full_name);

      if (!result) {
        return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
      }

      res.status(201).json({
        id: result.id,
        email: result.email,
        full_name: result.full_name,
        email_verified: result.email_verified,
        message: 'Inscription réussie. Vérifiez votre email.',
      });
    } catch (error) {
      Logger.error('Register error:', error);
      const message = error instanceof Error ? error.message : 'Erreur inscription';
      res.status(400).json({ error: message });
    }
  }

  async confirmEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token manquant' });
      }

      const result = await this.authService.confirmEmail(token);

      if (!result) {
        return res.status(500).json({ error: 'Erreur confirmation email' });
      }

      res.status(200).json(result);
    } catch (error) {
      Logger.error('Confirm email error:', error);
      const message = error instanceof Error ? error.message : 'Erreur confirmation';
      res.status(400).json({ error: message });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email manquant' });
      }

      const result = await this.authService.requestPasswordReset(email);

      if (!result) {
        return res.status(500).json({ error: 'Erreur lors de la demande' });
      }

      res.status(200).json(result);
    } catch (error) {
      Logger.error('Request password reset error:', error);
      res.status(500).json({ error: 'Erreur lors de la demande' });
    }
  }

  async validateResetToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ valid: false });
      }

      const result = await this.authService.validateResetToken(token as string);

      res.status(200).json(result);
    } catch (error) {
      Logger.error('Validate reset token error:', error);
      res.status(500).json({ valid: false });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, new_password } = req.body;

      if (!token || !new_password) {
        return res.status(400).json({ error: 'Données manquantes' });
      }

      const result = await this.authService.resetPassword(token, new_password);

      if (!result) {
        return res.status(500).json({ error: 'Erreur réinitialisation' });
      }

      res.status(200).json(result);
    } catch (error) {
      Logger.error('Reset password error:', error);
      const message = error instanceof Error ? error.message : 'Erreur réinitialisation';
      res.status(400).json({ error: message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies.remember_me_token;

      if (token) {
        await this.authService.logout(token);
      }

      res.clearCookie('remember_me_token');
      res.status(200).json({ message: 'Déconnecté' });
    } catch (error) {
      Logger.error('Logout error:', error);
      res.status(500).json({ error: 'Erreur déconnexion' });
    }
  }

  async verifyRememberMe(req: Request, res: Response) {
    try {
      const token = req.cookies.remember_me_token;

      if (!token) {
        return res.status(401).json({ authenticated: false });
      }

      const user = await this.authService.verifyRememberToken(token);

      if (!user) {
        return res.status(401).json({ authenticated: false });
      }

      res.status(200).json({
        authenticated: true,
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        email_verified: user.email_verified,
        role: user.role,
      });
    } catch (error) {
      Logger.error('Verify remember me error:', error);
      res.status(401).json({ authenticated: false });
    }
  }
}