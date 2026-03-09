export interface ProductImageResponseDto {
  id: string;
  productId: string;
  altText?: string | null;
  isMain: boolean;
}