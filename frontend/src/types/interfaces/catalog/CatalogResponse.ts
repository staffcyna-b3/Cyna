import { ProductStatus } from "../../enums/product/ProductStatus";
import { ProductPictureResponse } from "./ProductPictureResponse";
import { CategoryBasic } from "../category/CategoryBasic";

export interface CatalogResponse {
  id: string;
  slug: string;
  category: CategoryBasic;
  name: string;
  description?: string | null;
  price: number;
  discountedPrice?: number | null;
  discountValue?: number | null;
  discountType?: string | null;
  stock: number;
  status: ProductStatus;
  isService: boolean;
  duration?: number | null;
  priority: number;
  images?: ProductPictureResponse[];
  createdAt: Date;
  updatedAt: Date;
}