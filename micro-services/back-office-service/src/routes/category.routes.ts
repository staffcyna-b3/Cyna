import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { CategoryService } from '../services/category.service';
import { CategoryRepository } from '../repository/category.repository';
import { ICategoryService } from '../interfaces/ICategoryService';
import { validatorSchema } from '../middlewares/validations';
import { categoryFiltersQuerySchema, categoryIdParamSchema, reorderCategoryDisplayPrioritySchema } from '../schemas/category.schemas';

const router = Router();

const categoryRepository = new CategoryRepository();
const categoryService: ICategoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.get('/', validatorSchema({ query: categoryFiltersQuerySchema }), (req, res) => categoryController.list(req, res));
router.get('/select-options', validatorSchema({ query: categoryFiltersQuerySchema }), (req, res) => categoryController.listForSelect(req, res));
router.get('/:id', validatorSchema({ params: categoryIdParamSchema }), (req, res) => categoryController.getById(req, res));
router.patch('/display-priority', validatorSchema({ body: reorderCategoryDisplayPrioritySchema }), (req, res) => categoryController.reorderDisplayPriority(req, res));

export default router;
