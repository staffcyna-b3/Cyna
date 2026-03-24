import { createContext } from "react";
import { CatalogContextProps } from "@/types/interfaces/catalog/CatalogContextProps";

export const CatalogContext = createContext<CatalogContextProps | undefined>(
	undefined
);
