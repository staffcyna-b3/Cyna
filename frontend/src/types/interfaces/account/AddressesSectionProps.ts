import type { Address } from '../address/Address';

export interface Props {
  addresses: Address[];
  onAddressesChange: (addresses: Address[]) => void;
}
