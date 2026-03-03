import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { Logger } from '../common/logger';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { email, password, remember_me } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
      }

      const result = await this.authService.login(email, password, remember_me);

      // Envoyer le token en cookie
      if (result.rememberToken) {
        res.cookie('remember_me_token', result.rememberToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
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
      Logger.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Erreur login';
      res.status(401).json({ error: message });
    }
  }

  async verifyRememberMe(req: Request, res: Response) {
    try {
      const token = req.cookies.remember_me_token;

      if (!token) {
        return res.status(401).json({ authenticated: false });
      }

      const user = await this.authService.verifyRememberToken(token);

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

  async register(req: Request, res: Response) {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Données manquantes' });
        }

        const user = await this.authService.register(email, password, full_name);

        res.status(201).json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        email_verified: user.email_verified,
        message: 'Inscription réussie',
        });
    } catch (error) {
        Logger.error('Register error:', error);
        const message = error instanceof Error ? error.message : 'Erreur inscription';
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
      res.status(500).json({ error: 'Erreur logout' });
    }
  }
}