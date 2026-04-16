import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../services/category.service';
import { CategoryRepository } from '../repository/category.repository';
import { ICategoryService } from '../interfaces/ICategoryService';

const router = Router();

const categoryRepository = new CategoryRepository();
const categoryService: ICategoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.get('/categories', (req, res) => categoryController.list(req, res));
router.get('/categories/select-options', (req, res) => categoryController.listForSelect(req, res));
router.get('/categories/:id', (req, res) => categoryController.getById(req, res));

export default router;
