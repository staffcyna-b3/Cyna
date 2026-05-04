import { ProductStatus } from "../../enum/ProductStatus";
import { ProductImageResponseDto } from "./ProductImageResponse.dto";
import { CategoryResponseDto } from "./CategoryResponse.dto";

export interface ProductResponseDto {
  id: string;
  slug: string;
  category: CategoryResponseDto;
  name: string;
  description?: string | null;
  price: number;
  discountedPrice: number | null;
  discountValue: number | null;
  discountType: string | null;
  stock: number;
  status: ProductStatus;
  isService: boolean;
  duration?: number | null;
  priority: number;
  images?: ProductImageResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}