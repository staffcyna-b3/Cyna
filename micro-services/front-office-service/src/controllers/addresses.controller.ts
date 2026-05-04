import { Request, Response } from 'express';
import { HttpError } from '../common/httpError';
import { Logger } from '../common/logger';
import { IAddressService } from '../interfaces/AddressService';
import { isValidUuid } from '../common/validation';

export class AddressesController {
  constructor(private readonly addressService: IAddressService) {}

  async getAll(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;
      const addresses = await this.addressService.getAll(userId);
      return res.status(200).json(addresses);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error fetching addresses');
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;
      const address = await this.addressService.create(userId, req.body);
      return res.status(201).json(address);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error creating address');
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const address = await this.addressService.update(userId, id, req.body);
      return res.status(200).json(address);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error updating address');
    }
  }

  async setDefault(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const address = await this.addressService.setDefault(userId, id);
      return res.status(200).json(address);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error setting default address');
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.addressService.delete(userId, id);
      return res.status(204).send();
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error deleting address');
    }
  }

  private getUserId(req: Request, res: Response): string | null {
    const userIdHeader = req.headers['x-user-id'];
    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
    if (!isValidUuid(userId)) {
      res.status(401).json({ message: 'Unauthorized' });
      return null;
    }
    return userId;
  }

  private handleError(res: Response, error: unknown, fallbackMessage: string) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    Logger.error(fallbackMessage, { message: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ message: 'Internal server error' });
  }
}
