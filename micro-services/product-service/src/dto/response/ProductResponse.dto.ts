import { ProductStatus } from "../../enum/ProductStatus";
import { ProductImageResponseDto } from "./ProductImageResponse.dto";

export interface ProductResponseDto {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  isService: boolean;
  duration?: number | null;
  priority: number;
  images?: ProductImageResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}