import { Period } from "@/types/Period";

export interface AddToCartOptions {
  quantity?: number;
  period?: Period;
  name?: string;
  unitPrice?: number;
  isService?: boolean;
  stock?: number;
}