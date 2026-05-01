import Subscription from '../models/Subscription';
import { SubscriptionAdminDTO } from '../dto/SubscriptionAdminDTO';

export interface ISubscriptionRepository {
  findAll(): Promise<SubscriptionAdminDTO[]>;
  findById(id: string): Promise<Subscription | null>;
  cancel(id: string): Promise<void>;
}
