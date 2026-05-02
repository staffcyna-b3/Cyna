import { Period } from "@/types/Period";

export interface AddToCartOptions {
  quantity?: number;
  period?: Period;
  name?: string;
  unitPrice?: number;
  discountedUnitPrice?: number;
  isService?: boolean;
  stock?: number;
}