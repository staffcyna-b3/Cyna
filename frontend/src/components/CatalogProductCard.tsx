import React from "react";
import { CatalogResponse } from "../types/interfaces/catalog/CatalogResponse";
import byteaToImage from "../utils/byteaToImage";
import { ProductPictureResponse } from "../types/interfaces/catalog/ProductPictureResponse";
import { ExtPicture } from "../types/ExtPicture";


const placeholder =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%2322293a'/></svg>";

export const CatalogProductCard = ({ product }: { product: CatalogResponse }) => {
  const mainImage = product.images?.find((i) => i.isMain) ?? product.images?.[0];

  const imgSrc = (() => {
    if (!mainImage) return placeholder;
    const anyImg = mainImage as unknown as ExtPicture<ProductPictureResponse>;
    const maybeData = anyImg.data ?? anyImg.base64 ?? anyImg.bytea ?? anyImg.hex;
    if (maybeData) {
      // allow caller to specify mime type on the image object
      return byteaToImage(maybeData, anyImg.mime || "image/png");
    }
    if (anyImg.url) return anyImg.url;
    if (mainImage.id) return `/api/media/${mainImage.id}`;
    return placeholder;
  })();

  return (
    <article className="bg-gradient-to-b from-[#0f0b1a] to-[#171026] shadow-lg rounded-xl overflow-hidden text-white w-full sm:w-72 md:w-80">
      <div className="h-44 bg-gradient-to-r from-[#0d0a16] to-[#1b1630] flex items-center justify-center">
        <img className="w-full h-full object-cover" src={imgSrc} alt={(mainImage as unknown as ExtPicture<ProductPictureResponse>)?.altText ?? product.name} />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="text-xs text-[#9aa0c7]"></div>
        <h3 className="text-lg font-semibold leading-snug">{product.name}</h3>
        <p className="text-sm text-[#b7bdd9] min-h-[3rem]">{product.description}</p>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-xl font-extrabold">{product.price.toFixed(2)} €</div>
          <div className="text-sm text-[#9aa0c7]">{product.stock > 0 ? `En stock (${product.stock})` : "Indisponible"}</div>
        </div>
      </div>
    </article>
  );
};

export default CatalogProductCard;
