export interface ProductPictureResponse {
  id: string;
  productId: string;
  altText?: string | null;
  isMain: boolean;
  base64: string;
}