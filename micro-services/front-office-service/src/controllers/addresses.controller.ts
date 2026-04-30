import { Request, Response } from 'express';
import { HttpError } from '../common/HttpError';
import { Logger } from '../common/logger';
import { IAddressService } from '../interfaces/AddressService';
import { AddressUpsertData } from '../interfaces/AddressUpsertData';
import { isValidUuid } from '../common/validation';

export class AddressesController {
  constructor(private readonly addressService: IAddressService) {}

  async getAddresses(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;

      const result = await this.addressService.getAddresses(userId);
      return res.status(200).json(result);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error fetching addresses');
    }
  }

  async upsertAddresses(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req, res);
      if (!userId) return;

      const billing = req.body.billing as AddressUpsertData;
      const shipping = req.body.shipping as AddressUpsertData;

      if (!billing || !shipping) {
        return res.status(422).json({ message: 'billing and shipping are required' });
      }

      const result = await this.addressService.upsertAddresses(userId, billing, shipping);
      return res.status(200).json(result);
    } catch (error: unknown) {
      return this.handleError(res, error, 'Error upserting addresses');
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
