import { Router } from 'express';
import { AddressesController } from '../controllers/addresses.controller';
import { AddressService } from '../services/address.service';
import { AddressRepository } from '../repository/address.repository';

const router = Router();

const addressRepository = new AddressRepository();
const addressService = new AddressService(addressRepository);
const controller = new AddressesController(addressService);

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));
router.patch('/:id/default', (req, res) => controller.setDefault(req, res));

export default router;
