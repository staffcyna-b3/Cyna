import { Request, Response, Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router = Router();
const categoryController = new CategoryController();

router.get('/', (req: Request, res: Response) =>categoryController.listCategories(req, res));

export default router;
