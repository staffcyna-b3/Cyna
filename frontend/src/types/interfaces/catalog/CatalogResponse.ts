import { ProductStatus } from "../../enums/product/ProductStatus";
import { ProductPictureResponse } from "./ProductPictureResponse";
import { CategoryBasic } from "../category/CategoryBasic";

export interface CatalogResponse {
  id: string;
  category: CategoryBasic;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  isService: boolean;
  duration?: number | null;
  priority: number;
  images?: ProductPictureResponse[];
  createdAt: Date;
  updatedAt: Date;
}