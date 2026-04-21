import type { Address } from '../address/Address';

export interface Props {
  address: Address;
  onSetDefault: (address: Address) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}
