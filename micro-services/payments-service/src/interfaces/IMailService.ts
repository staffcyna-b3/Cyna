import { IOrderConfirmationDetails } from './IOrderConfirmationDetails';

export interface IMailService {
  sendOrderConfirmationEmail(email: string, details: IOrderConfirmationDetails): Promise<void>;
}
