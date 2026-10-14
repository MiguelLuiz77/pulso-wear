export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  image?: string;
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

// Quando as fotos reais estiverem disponíveis, coloque-as em public/images/products/<id>.jpg e informe o caminho em image.
export const products: Product[] = [
  { id: "calca-jeans", categoryId: "calcas", name: "Calça jeans", price: 105 },
  { id: "calca-social", categoryId: "calcas", name: "Calça social", price: 105 },
  { id: "calca-feminina", categoryId: "calcas", name: "Calça feminina", price: 105 },
  { id: "calca-de-moletom", categoryId: "calcas", name: "Calça de moletom", price: 65 },
  { id: "bermuda-de-sarja", categoryId: "bermudas-shorts", name: "Bermuda de sarja", price: 75 },
  { id: "short-de-sarja", categoryId: "bermudas-shorts", name: "Short de sarja", price: 65 },
  { id: "bermuda-tecnologica", categoryId: "bermudas-shorts", name: "Bermuda tecnológica", price: 59 },
  { id: "bermuda-acetinada", categoryId: "bermudas-shorts", name: "Bermuda acetinada", price: 85 },
  { id: "camiseta-do-brasil", categoryId: "camisetas-camisas", name: "Camiseta do Brasil", price: 130 },
  { id: "camiseta-suedini", categoryId: "camisetas-camisas", name: "Camiseta Suedini", price: 57 },
  { id: "camiseta-peruana", categoryId: "camisetas-camisas", name: "Camiseta peruana", price: 55 },
  { id: "camiseta-wafers", categoryId: "camisetas-camisas", name: "Camiseta Wafers", price: 59 },
  { id: "camiseta-plus-size", categoryId: "camisetas-camisas", name: "Camiseta plus size", price: 65 },
  { id: "polo-piquet-duplo", categoryId: "polos", name: "Polo piquet duplo", price: 75 },
  { id: "polo-peruana", categoryId: "polos", name: "Polo peruana", price: 70 },
  { id: "bobojaco", categoryId: "moletons-frio", name: "Bobojaco", price: 130 },
  { id: "sueter", categoryId: "moletons-frio", name: "Suéter", price: 95 },
  { id: "moletom-de-tres-cabos", categoryId: "moletons-frio", name: "Moletom de três cabos", price: 105 },
  { id: "cuecas", categoryId: "roupas-intimas", name: "Cuecas", price: 33 },
];
