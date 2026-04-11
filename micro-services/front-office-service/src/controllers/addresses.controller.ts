import { Request, Response } from 'express';
import { HttpError } from '../common/HttpError';
import { Logger } from '../common/logger';
import { IAddressRepository } from '../interfaces/AddressRepository';
import { AddressType } from '../enum/AddressType';
import { isValidUuid } from '../common/validation';

export class AddressesController {
  constructor(private readonly addressRepository: IAddressRepository) {}

  async getAddresses(req: Request, res: Response) {
    try {
      const userIdHeader = req.headers['x-user-id'];
      const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

      if (!isValidUuid(userId)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const addresses = await this.addressRepository.findAllByUserId(userId);
      const billing = addresses.find((a) => a.type === AddressType.BILLING);
      const shipping = addresses.find((a) => a.type === AddressType.SHIPPING);

      return res.status(200).json({
        billing: billing
          ? { id: billing.id, addressLine1: billing.address_line1, city: billing.city, postcode: billing.postcode, country: billing.country }
          : null,
        shipping: shipping
          ? { id: shipping.id, addressLine1: shipping.address_line1, city: shipping.city, postcode: shipping.postcode, country: shipping.country }
          : null,
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      Logger.error('Error fetching addresses', { message: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
