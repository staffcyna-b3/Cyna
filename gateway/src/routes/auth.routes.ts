import { Router } from 'express';
import crypto from 'crypto';
import User from '../models/User';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;

    // Vérifier utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier mot de passe (utiliser bcrypt quand JWT sera prêt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Remember me
    if (remember_me) {
      // Générer token aléatoire sécurisé
      const rememberToken = crypto.randomBytes(32).toString('hex');
      
      // Stocker en BDD
      user.remember_me_token = rememberToken;
      await user.save();

      // Envoyer via cookie
      res.cookie('remember_me_token', rememberToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      email_verified: user.email_verified,
    });

  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

router.get('/auth/verify-remember-me', async (req, res) => {
  try {
    const rememberToken = req.cookies.remember_me_token;

    if (!rememberToken) {
      return res.status(401).json({ authenticated: false });
    }

    // Chercher l'utilisateur avec ce token
    const user = await User.findOne({
      where: { remember_me_token: rememberToken },
    });

    if (!user) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      email_verified: user.email_verified,
    });

  } catch (error) {
    return res.status(500).json({ authenticated: false });
  }
});

router.post('/auth/logout', async (req, res) => {
  try {
    const rememberToken = req.cookies.remember_me_token;

    // Si le token existe, le supprimer de la BDD
    if (rememberToken) {
      const user = await User.findOne({
        where: { remember_me_token: rememberToken },
      });
      
      if (user) {
        user.remember_me_token = null;
        await user.save();
      }
    }

    // Supprimer le cookie
    res.clearCookie('remember_me_token');

    return res.status(200).json({ message: 'Déconnecté' });

  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

export default router;
