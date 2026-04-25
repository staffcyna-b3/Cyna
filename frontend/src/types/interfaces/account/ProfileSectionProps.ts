import type { UserProfile } from '../user/UserProfile';

export interface Props {
  profile: UserProfile;
  token: string;
  onUpdated: (updated: UserProfile) => void;
}
