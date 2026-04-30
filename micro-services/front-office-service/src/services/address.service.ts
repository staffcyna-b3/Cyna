import { IAddressRepository } from '../interfaces/AddressRepository';
import { IAddressService, GetAddressesResult } from '../interfaces/AddressService';
import { AddressUpsertData } from '../interfaces/AddressUpsertData';
import { UpsertAddressesResult } from '../interfaces/UpsertAddressesResult';
import { AddressType } from '../enum/AddressType';

export class AddressService implements IAddressService {
  constructor(private readonly addressRepository: IAddressRepository) {}

  async getAddresses(userId: string): Promise<GetAddressesResult> {
    const addresses = await this.addressRepository.findAllByUserId(userId);
    const billing = addresses.find((a) => a.type === AddressType.BILLING);
    const shipping = addresses.find((a) => a.type === AddressType.SHIPPING);

    return {
      billing: billing
        ? { id: billing.id, addressLine1: billing.address_line1, city: billing.city, postcode: billing.postcode, country: billing.country }
        : null,
      shipping: shipping
        ? { id: shipping.id, addressLine1: shipping.address_line1, city: shipping.city, postcode: shipping.postcode, country: shipping.country }
        : null,
    };
  }

  async upsertAddresses(
    userId: string,
    billing: AddressUpsertData,
    shipping: AddressUpsertData,
  ): Promise<UpsertAddressesResult> {
    const [billingAddress, shippingAddress] = await Promise.all([
      this.addressRepository.upsertByType(userId, AddressType.BILLING, billing),
      this.addressRepository.upsertByType(userId, AddressType.SHIPPING, shipping),
    ]);

    return {
      billing: {
        id: billingAddress.id,
        addressLine1: billingAddress.address_line1,
        city: billingAddress.city,
        postcode: billingAddress.postcode,
        country: billingAddress.country,
      },
      shipping: {
        id: shippingAddress.id,
        addressLine1: shippingAddress.address_line1,
        city: shippingAddress.city,
        postcode: shippingAddress.postcode,
        country: shippingAddress.country,
      },
    };
  }
}
