import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';



const router = Router();

//Login
const authController = new AuthController()
router.post('/login', (req, res) => authController.login(req, res) )

//Refresh
router.post('/refresh', (req, res) => authController.refresh(req, res))


//me 
router.get('/me', authMiddleware, (req, res) => authController.me(req, res))




export default router;
