import type { UserProfile } from '../user/UserProfile';

export interface Props {
  profile: UserProfile;
  onUpdated: (updated: UserProfile) => void;
}
