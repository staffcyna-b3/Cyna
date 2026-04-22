import { Request, Response } from 'express';
import { IUserService } from '../interfaces/IUserService';

export class UserController {
  constructor(private readonly service: IUserService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await this.service.getAll(page, limit);
    res.status(200).json({ success: true, data: result });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await this.service.getById(id);
    res.status(200).json({ success: true, data: user });
  }
}
