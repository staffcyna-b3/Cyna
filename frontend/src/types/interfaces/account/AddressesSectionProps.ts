import type { Address } from '../address/Address';

export interface Props {
  token: string;
  addresses: Address[];
  onAddressesChange: (addresses: Address[]) => void;
}
