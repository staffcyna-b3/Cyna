import { Request, Response, Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import CategoryService from '../services/category.service';
import CategoryRepository from '../repository/category.repository';

const router = Router();
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.get('/', (req: Request, res: Response) => categoryController.listCategories(req, res));

export default router;
