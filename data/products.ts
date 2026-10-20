import { productImages } from "./product-images";

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  images?: string[];
  sizes?: string[];
  colors?: string[];
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

// As galerias de cada produto são definidas no mapeamento data/product-images.ts.
const clothingSizes = ["P", "M", "G"];
const sweatpantsSizes = ["M", "G"];
const pantsSizes = ["38", "40", "42", "44", "46", "48"];
const otherBermudaSizes = ["38", "40", "42", "44", "46", "48"];
const technicalBermudaSizes = ["P", "M", "G", "G1", "G2", "G3", "G4"];

export const products: Product[] = [
  { id: "calca-jeans", categoryId: "calcas", name: "Calça jeans", price: 105, images: productImages["calca-jeans"], sizes: pantsSizes },
  { id: "calca-social", categoryId: "calcas", name: "Calça social", price: 105, images: productImages["calca-social"], sizes: pantsSizes },
  { id: "calca-feminina", categoryId: "calcas", name: "Calça feminina", price: 105, images: productImages["calca-feminina"], sizes: pantsSizes },
  { id: "calca-de-moletom", categoryId: "calcas", name: "Calça de moletom", price: 65, images: productImages["calca-de-moletom"], sizes: sweatpantsSizes },
  { id: "bermuda-de-sarja", categoryId: "bermudas-shorts", name: "Bermuda de sarja", price: 75, images: productImages["bermuda-de-sarja"], sizes: otherBermudaSizes },
  { id: "short-de-sarja", categoryId: "bermudas-shorts", name: "Short de sarja", price: 65, images: productImages["short-de-sarja"], sizes: otherBermudaSizes },
  { id: "bermuda-tecnologica", categoryId: "bermudas-shorts", name: "Bermuda tecnológica", price: 59, images: productImages["bermuda-tecnologica"], sizes: technicalBermudaSizes },
  { id: "bermuda-acetinada", categoryId: "bermudas-shorts", name: "Bermuda acetinada", price: 85, images: productImages["bermuda-acetinada"], sizes: otherBermudaSizes },
  { id: "camiseta-suedini", categoryId: "camisetas-camisas", name: "Camiseta Suedini", price: 57, images: productImages["camiseta-suedini"], sizes: clothingSizes },
  { id: "camiseta-peruana", categoryId: "camisetas-camisas", name: "Camiseta peruana", price: 55, images: productImages["camiseta-peruana"], sizes: clothingSizes },
  { id: "camiseta-wafers", categoryId: "camisetas-camisas", name: "Camiseta Wafers", price: 59, images: productImages["camiseta-wafers"], sizes: clothingSizes },
  { id: "camiseta-plus-size", categoryId: "camisetas-camisas", name: "Camiseta plus size", price: 65, images: productImages["camiseta-plus-size"], sizes: clothingSizes },
  { id: "polo-piquet-duplo", categoryId: "polos", name: "Polo piquet duplo", price: 75, images: productImages["polo-piquet-duplo"], sizes: clothingSizes },
  { id: "polo-peruana", categoryId: "polos", name: "Polo peruana", price: 70, images: productImages["polo-peruana"], sizes: clothingSizes },
  { id: "bobojaco", categoryId: "moletons-frio", name: "Bobojaco", price: 130, images: productImages["bobojaco"], sizes: clothingSizes },
  { id: "sueter", categoryId: "moletons-frio", name: "Suéter", price: 95, images: productImages["sueter"], sizes: clothingSizes },
  { id: "moletom-de-tres-cabos", categoryId: "moletons-frio", name: "Moletom de três cabos", price: 105, images: productImages["moletom-de-tres-cabos"], sizes: clothingSizes },
  { id: "cuecas", categoryId: "roupas-intimas", name: "Cuecas", price: 33, images: productImages["cuecas"], sizes: clothingSizes },
];
