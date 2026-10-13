export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  sizes?: string[];
  colors?: string[];
};

export const store = {
  name: "PULSO°",
  whatsapp: "https://wa.me/5512997537258",
  instagram: "https://www.instagram.com/pulso.ofc?xtok=MWNyZ2RvbXNxenllag==",
};

export const categories = [
  { id: "camisetas", name: "Camisetas", number: "01" },
  { id: "moletons", name: "Moletons", number: "02" },
  { id: "calcas", name: "Calças", number: "03" },
  { id: "jaquetas", name: "Jaquetas", number: "04" },
  { id: "acessorios", name: "Acessórios", number: "05" },
];

// Preços e itens abaixo são dados fictícios para testar a demonstração.
export const products: Product[] = [
  { id: "demo-01", categoryId: "camisetas", name: "Produto de demonstração 01", price: 89.9, sizes: ["P", "M", "G", "GG"], colors: ["Preto", "Branco"] },
  { id: "demo-02", categoryId: "moletons", name: "Produto de demonstração 02", price: 149.9, sizes: ["P", "M", "G", "GG"], colors: ["Preto", "Cinza"] },
  { id: "demo-03", categoryId: "calcas", name: "Produto de demonstração 03", price: 169.9, sizes: ["38", "40", "42", "44"], colors: ["Preto", "Cinza"] },
  { id: "demo-04", categoryId: "jaquetas", name: "Produto de demonstração 04", price: 219.9, sizes: ["P", "M", "G", "GG"], colors: ["Preto", "Verde"] },
  { id: "demo-05", categoryId: "acessorios", name: "Produto de demonstração 05", price: 49.9, colors: ["Preto", "Branco"] },
];
