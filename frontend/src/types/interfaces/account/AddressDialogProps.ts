import type { Address } from '../address/Address';

export interface Props {
  open: boolean;
  onClose: () => void;
  editTarget: Address | null;
  onSaved: (address: Address) => Promise<void>;
}
