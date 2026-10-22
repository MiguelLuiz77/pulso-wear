import productCatalog from "./product-catalog.json" with { type: "json" };
import { productImages } from "./product-images";

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  availability?: "coming-soon";
};

export const store = {
  name: "PULSO°",
  whatsapp: "https://wa.me/5512997537258",
  instagram: "https://www.instagram.com/pulso.ofc?xtok=MWNyZ2RvbXNxenllag==",
};

export const categories = [
  { id: "calcas", name: "Calças", number: "01" },
  { id: "bermudas-shorts", name: "Bermudas e shorts", number: "02" },
  { id: "camisetas-camisas", name: "Camisetas e camisas", number: "03" },
  { id: "polos", name: "Polos", number: "04" },
  { id: "moletons-frio", name: "Moletons e roupas de frio", number: "05" },
  { id: "roupas-intimas", name: "Roupas íntimas", number: "06" },
];

// O catálogo JSON é a fonte única de preços e tamanhos para o site e o agente.
// As galerias de cada produto continuam definidas em data/product-images.ts.
export const products: Product[] = productCatalog.map((item) => ({
  id: item.id,
  categoryId: item.categoryId,
  name: item.name,
  price: item.priceCents / 100,
  images: productImages[item.id] ?? [],
  sizes: item.sizes,
  ...(item.availability === "coming-soon" ? { availability: "coming-soon" as const } : {}),
}));
