"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { categories, products, store, type Product } from "@/data/products";

type CartLine = { productId: string; quantity: number; size: string; color: string };
type IconName = "search" | "bag" | "menu" | "close" | "arrow" | "image" | "spark" | "layers" | "chat" | "headset" | "plus" | "minus" | "trash" | "instagram" | "external" | "check";

const iconShapes: Record<IconName, ReactNode> = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  bag: <><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
  spark: <><path d="m12 3 1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.5-.7L4 20l1.5-3.8A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 12h8" /></>,
  headset: <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><path d="M4 13h3v6H5a1 1 0 0 1-1-1v-5Zm16 0h-3v6h2a1 1 0 0 0 1-1v-5Z" /><path d="M17 19a5 5 0 0 1-5 2" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <path d="M5 12h14" />,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 1 14h10l1-14M9 7V4h6v3" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{iconShapes[name]}</svg>;
}

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const lineKey = (line: CartLine) => `${line.productId}|${line.size}|${line.color}`;
const wholesaleThreshold = 4;
const wholesaleDiscount = 5;
const discountedPrice = (price: number) => Math.max(0, price - wholesaleDiscount);
const categoryPreviewProducts: Record<string, string> = {
  calcas: "calca-jeans",
  "bermudas-shorts": "short-de-sarja",
  "camisetas-camisas": "camiseta-peruana",
  polos: "polo-peruana",
  "moletons-frio": "bobojaco",
  "roupas-intimas": "cuecas",
};

function Mark({ size = 36 }: { size?: number }) {
  return <Image className="brand-mark" src="/images/pulso-mark.jpg" alt="" width={size} height={size} priority />;
}

function Placeholder({ label = "ESPAÇO RESERVADO PARA FOTO" }: { label?: string }) {
  return <div className="photo-placeholder"><div className="placeholder-icon"><Icon name="image" size={28} /></div><span>{label}</span></div>;
}

function ProductCard({ product, sizes, colors, setSizes, setColors, imageIndices, setImageIndices, onAdd, focusable = true }: {
  product: Product;
  sizes: Record<string, string>;
  colors: Record<string, string>;
  setSizes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  imageIndices: Record<string, number>;
  setImageIndices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onAdd: (product: Product) => void;
  focusable?: boolean;
}) {
  const category = categories.find((item) => item.id === product.categoryId)?.name;
  const images = product.images ?? [];
  const imageIndex = images.length ? (imageIndices[product.id] ?? 0) % images.length : 0;
  const changeImage = (direction: -1 | 1) => {
    if (images.length < 2) return;
    setImageIndices((current) => ({
      ...current,
      [product.id]: (imageIndex + direction + images.length) % images.length,
    }));
  };
  return (
    <article className="product-card">
      <div className="product-photo">{images[imageIndex] ? <Image className="product-image" src={images[imageIndex]} alt={`${product.name}, foto ${imageIndex + 1} de ${images.length}`} fill sizes="(max-width: 760px) 76vw, 278px" /> : <Placeholder label="FOTO REAL EM BREVE" />}</div>
      <div className="product-gallery-controls" aria-label={`Galeria de ${product.name}`}>
        <button type="button" className="gallery-previous" aria-label={`Foto anterior de ${product.name}`} tabIndex={focusable ? 0 : -1} disabled={images.length < 2} onClick={() => changeImage(-1)}><Icon name="arrow" size={15} /></button>
        <span aria-live={focusable ? "polite" : undefined}>{images.length ? `${String(imageIndex + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}` : "FOTO EM BREVE"}</span>
        <button type="button" className="gallery-next" aria-label={`Próxima foto de ${product.name}`} tabIndex={focusable ? 0 : -1} disabled={images.length < 2} onClick={() => changeImage(1)}><Icon name="arrow" size={15} /></button>
      </div>
      <div className="product-info">
        <p className="eyebrow product-category">{category}</p>
        <h3>{product.name}</h3>
        <p className="product-price">{money(product.price)}</p>
        <p className="wholesale-hint">Compre 4 peças ou mais e pague R$ 5,00 a menos por peça.</p>
        {product.sizes?.length || product.colors?.length ? <div className="variant-row">
          {product.sizes?.length ? <label><span>Tamanho</span><select tabIndex={focusable ? 0 : -1} value={sizes[product.id] || ""} onChange={(event) => setSizes((current) => ({ ...current, [product.id]: event.target.value }))}><option value="">Selecione</option>{product.sizes.map((size) => <option key={size}>{size}</option>)}</select></label> : null}
          {product.colors?.length ? <label><span>Cor</span><select tabIndex={focusable ? 0 : -1} value={colors[product.id] || ""} onChange={(event) => setColors((current) => ({ ...current, [product.id]: event.target.value }))}><option value="">Selecione</option>{product.colors.map((color) => <option key={color}>{color}</option>)}</select></label> : null}
        </div> : null}
        <button className="button button-dark add-button" type="button" tabIndex={focusable ? 0 : -1} onClick={() => onAdd(product)}>ADICIONAR AO CARRINHO <Icon name="plus" size={16} /></button>
      </div>
    </article>
  );
}

export default function Home() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [colors, setColors] = useState<Record<string, string>>({});
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
  const [observations, setObservations] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("pulso-demo-cart") || "[]") as CartLine[];
      const valid = Array.isArray(saved) ? saved.filter((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product && Number.isInteger(line.quantity) && line.quantity > 0 && (!product.sizes?.length || product.sizes.includes(line.size)) && (!product.colors?.length || product.colors.includes(line.color));
      }) : [];
      setCart(valid);
    } catch { setCart([]); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("pulso-demo-cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-js");
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) { elements.forEach((element) => element.classList.add("in-view")); return () => root.classList.remove("has-js"); }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("in-view"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); root.classList.remove("has-js"); };
  }, []);

  useEffect(() => {
    if (!cartOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setCartOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [cartOpen]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const categoryName = categories.find((category) => category.id === product.categoryId)?.name || "";
    const matchesCategory = activeCategory === "all" || product.categoryId === activeCategory;
    const matchesSearch = `${product.name} ${categoryName}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"));
    return matchesCategory && matchesSearch;
  }), [activeCategory, search]);
  const selectedCategory = categories.find((category) => category.id === activeCategory);
  const cartCount = cart.reduce((count, line) => count + line.quantity, 0);
  const wholesaleActive = cartCount >= wholesaleThreshold;
  const originalSubtotal = cart.reduce((sum, line) => sum + (products.find((product) => product.id === line.productId)?.price || 0) * line.quantity, 0);
  const totalSavings = wholesaleActive ? cart.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    return sum + Math.min(wholesaleDiscount, product?.price || 0) * line.quantity;
  }, 0) : 0;
  const subtotal = originalSubtotal - totalSavings;

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectCategory = (id: string) => {
    setActiveCategory(id);
    setSearch("");
    scrollTo("colecao");
  };

  const addToCart = (product: Product) => {
    const size = product.sizes?.length ? sizes[product.id] || "" : "";
    const color = product.colors?.length ? colors[product.id] || "" : "";
    if ((product.sizes?.length && !product.sizes.includes(size)) || (product.colors?.length && !product.colors.includes(color))) {
      setNotice(`Escolha ${product.sizes?.length && !size ? "o tamanho" : "a cor"} para continuar.`);
      window.setTimeout(() => setNotice(""), 2800);
      return;
    }
    const added: CartLine = { productId: product.id, quantity: 1, size, color };
    setCart((current) => {
      const existing = current.find((line) => lineKey(line) === lineKey(added));
      return existing ? current.map((line) => lineKey(line) === lineKey(added) ? { ...line, quantity: line.quantity + 1 } : line) : [...current, added];
    });
    setNotice("Item adicionado ao carrinho.");
    window.setTimeout(() => setNotice(""), 2500);
  };

  const changeQuantity = (key: string, amount: number) => setCart((current) => current.map((line) => lineKey(line) === key ? { ...line, quantity: Math.max(1, line.quantity + amount) } : line));
  const removeLine = (key: string) => setCart((current) => current.filter((line) => lineKey(line) !== key));

  const checkout = () => {
    if (!cart.length) return;
    const detail = cart.map((line) => {
      const product = products.find((item) => item.id === line.productId)!;
      const options = [line.size && `Tamanho: ${line.size}`, line.color && `Cor: ${line.color}`].filter(Boolean).join(" | ");
      const unit = wholesaleActive ? discountedPrice(product.price) : product.price;
      return `- ${product.name}\n  Quantidade: ${line.quantity}${options ? `\n  ${options}` : ""}\n  Preço original por unidade: ${money(product.price)}\n  Preço por unidade com desconto: ${money(unit)}\n  Subtotal: ${money(unit * line.quantity)}`;
    }).join("\n\n");
    const message = `Olá! Gostaria de fazer um pedido na ${store.name}.\n\nMeu pedido:\n\n${detail}\n\nTotal original: ${money(originalSubtotal)}\nDesconto de atacado: ${money(totalSavings)}\nValor final: ${money(subtotal)}\n\nObservações: ${observations.trim() || "(escreva aqui, se desejar)"}\n\nGostaria de confirmar a disponibilidade e as condições de compra.`;
    window.open(`${store.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <header className="site-header">
        <div className="announcement"><span>PULSO°</span><span>ESTILO. IDENTIDADE. MOVIMENTO.</span><span>DEMONSTRAÇÃO VISUAL</span></div>
        <div className="nav-shell">
          <a className="brand" href="#inicio" aria-label="PULSO°, início"><Mark /><span>PULSO°</span></a>
          <nav className={`nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
            <a href="#inicio" onClick={() => setMenuOpen(false)}>Início</a>
            <a href="#colecao" onClick={() => { setActiveCategory("all"); setSearch(""); setMenuOpen(false); }}>Coleção</a>
            <a href="#categorias" onClick={() => setMenuOpen(false)}>Categorias</a>
            <a href="#sobre" onClick={() => setMenuOpen(false)}>Sobre a marca</a>
          </nav>
          <div className="nav-actions">
            <button className="icon-button search-button" onClick={() => setSearchOpen((open) => !open)} aria-label={searchOpen ? "Fechar busca" : "Buscar produtos"}><Icon name={searchOpen ? "close" : "search"} /></button>
            <button className="icon-button cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Abrir carrinho, ${cartCount} itens`}><Icon name="bag" /><span className="cart-count">{cartCount}</span></button>
            <button className="icon-button menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}><Icon name={menuOpen ? "close" : "menu"} /></button>
          </div>
        </div>
        {searchOpen ? <div className="search-panel"><label htmlFor="site-search">Buscar na coleção</label><div className="search-input-wrap"><Icon name="search" size={18} /><input id="site-search" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") scrollTo("colecao"); }} placeholder="Digite uma categoria ou produto" /><button type="button" onClick={() => { setSearch(""); scrollTo("colecao"); }}>Ver resultados <Icon name="arrow" size={16} /></button></div></div> : null}
      </header>

      <main>
        <section id="inicio" className="hero-section">
          <div className="hero-image" />
          <div className="hero-content page-width">
            <p className="eyebrow hero-eyebrow">ESTILO. IDENTIDADE. MOVIMENTO.</p>
            <h1>VISTA SUA<br /><span>ESSÊNCIA.</span></h1>
            <p className="hero-copy">Mais do que roupas.<br />Uma expressão de quem você é.</p>
            <button className="button button-light" onClick={() => scrollTo("colecao")}>EXPLORAR COLEÇÃO <Icon name="arrow" size={17} /></button>
          </div>
          <div className="hero-footnote"><span>01 / 05</span><span>ESTÉTICA URBANA · PULSO°</span><span>SCROLL PARA EXPLORAR ↓</span></div>
        </section>

        <section className="benefits" aria-label="Destaques da marca">
          <div className="benefit"><Icon name="spark" /><span><strong>Estilo autêntico</strong><small>A identidade PULSO°</small></span></div>
          <div className="benefit"><Icon name="layers" /><span><strong>Seleção de peças</strong><small>174 fotos no catálogo</small></span></div>
          <div className="benefit"><Icon name="chat" /><span><strong>Atendimento direto</strong><small>Converse pelo WhatsApp</small></span></div>
          <div className="benefit"><Icon name="headset" /><span><strong>Novidades da marca</strong><small>Acompanhe a PULSO°</small></span></div>
        </section>

        <section id="categorias" className="section categories-section page-width">
          <div className="section-heading" data-reveal><div><p className="eyebrow">ENCONTRE O SEU RITMO</p><h2>EXPLORE POR<br className="mobile-break" /> CATEGORIA</h2></div><p className="heading-note">Fotos organizadas<br />por categoria e modelo.</p></div>
          <div className="category-grid">
            {categories.map((category) => {
              const previewProductId = categoryPreviewProducts[category.id];
              const previewImage = products.find((product) => product.id === previewProductId)?.images?.[0];
              return <button className="category-card" key={category.id} onClick={() => selectCategory(category.id)} data-reveal>
                <div className="category-image">{previewImage ? <Image className="category-preview" src={previewImage} alt={`Peça em destaque: ${category.name}`} fill sizes="(max-width: 760px) 47vw, 28vw" /> : <Placeholder label="FOTO EM BREVE" />}<span className="category-number">{category.number}</span></div>
                <div className="category-label"><h3>{category.name}</h3><span>VER CATEGORIA <Icon name="arrow" size={15} /></span></div>
              </button>;
            })}
          </div>
        </section>

        <section id="colecao" className="section collection-section">
          <div className="page-width">
            <div className="section-heading collection-heading" data-reveal><div><p className="eyebrow">CATÁLOGO PULSO° · 18 PRODUTOS</p><h2>{selectedCategory ? selectedCategory.name : <>COLEÇÃO <span>PULSO°</span></>}</h2><p className="section-intro">Use as setas para ver as fotos de cada peça ou selecione uma categoria para filtrar a vitrine.</p></div>
              <div className="collection-controls"><div className="collection-filter"><button className={activeCategory === "all" ? "selected" : ""} onClick={() => setActiveCategory("all")}>Tudo</button>{categories.map((category) => <button className={activeCategory === category.id ? "selected" : ""} key={category.id} onClick={() => setActiveCategory(category.id)}>{category.name}</button>)}</div><button className="text-link" onClick={() => scrollTo("colecao")}>VER VITRINE <Icon name="arrow" size={15} /></button></div>
            </div>
            {filteredProducts.length ? <div className="carousel-window" data-reveal>
              <div className="product-track">
                <div className="product-set" aria-hidden="true">{filteredProducts.map((product) => <ProductCard key={`copy-${product.id}`} product={product} sizes={sizes} colors={colors} setSizes={setSizes} setColors={setColors} imageIndices={imageIndices} setImageIndices={setImageIndices} onAdd={addToCart} focusable={false} />)}</div>
                <div className="product-set">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} sizes={sizes} colors={colors} setSizes={setSizes} setColors={setColors} imageIndices={imageIndices} setImageIndices={setImageIndices} onAdd={addToCart} />)}</div>
              </div>
            </div> : <div className="no-products" data-reveal><Placeholder label="NENHUM PRODUTO NESTA BUSCA" /><p>Não encontramos itens com esse filtro.</p><button className="text-link" onClick={() => { setSearch(""); setActiveCategory("all"); }}>LIMPAR FILTROS <Icon name="arrow" size={15} /></button></div>}
            <div className="demo-note"><span className="demo-dot" /> Os preços seguem o catálogo informado. Confirme disponibilidade e condições pelo WhatsApp.</div>
          </div>
        </section>

        <section className="campaign-section section page-width">
          <div className="section-heading" data-reveal><div><p className="eyebrow">IDEIAS EM MOVIMENTO</p><h2>MANIFESTO<br />PULSO°</h2></div><p className="heading-note">Composições tipográficas<br />com espaço para campanhas reais.</p></div>
          <div className="campaign-grid">
            <article className="campaign-card campaign-dark" data-reveal><span className="campaign-index">01 — MARCA</span><Mark size={44} /><h3>ESTILO QUE<br />SE EXPRESSA.</h3><button className="campaign-link" onClick={() => scrollTo("sobre")}>CONHEÇA A PULSO° <Icon name="arrow" size={16} /></button></article>
            <article className="campaign-card campaign-light" data-reveal><span className="campaign-index">02 — IDENTIDADE</span><p className="campaign-word">PULSO<span>°</span></p><h3>SEU RITMO.<br />SUA PRESENÇA.</h3><button className="campaign-link" onClick={() => scrollTo("colecao")}>EXPLORAR <Icon name="arrow" size={16} /></button></article>
            <article className="campaign-card campaign-mid" data-reveal><span className="campaign-index">03 — PRÓXIMOS CAPÍTULOS</span><div className="campaign-lines"><span></span><span></span><span></span></div><h3>NOVAS<br />IDEIAS EM BREVE.</h3><button className="campaign-link" onClick={() => scrollTo("instagram")}>ACOMPANHE <Icon name="arrow" size={16} /></button></article>
          </div>
        </section>

        <section id="sobre" className="about-section">
          <div className="about-inner page-width" data-reveal><div className="about-mark"><Mark size={116} /><span>IDENTIDADE EM MOVIMENTO</span></div><div className="about-copy"><p className="eyebrow">SOBRE A MARCA</p><h2>SEU ESTILO.<br />SEU RITMO.<br /><span>SEU PULSO°.</span></h2><p>Mais do que roupas, uma expressão de quem você é. Este espaço está pronto para receber a apresentação oficial da PULSO°.</p><button className="button button-light" onClick={() => scrollTo("instagram")}>SIGA A PULSO° <Icon name="arrow" size={17} /></button></div></div>
        </section>

        <section id="instagram" className="instagram-section page-width" data-reveal><div className="instagram-icon"><Icon name="instagram" size={25} /></div><div><p className="eyebrow">PULSO° NAS REDES</p><h2>ENCONTRE A PULSO°<br className="mobile-break" /> NO INSTAGRAM.</h2></div><a className="button button-dark" href={store.instagram} target="_blank" rel="noopener noreferrer">SIGA A PULSO° NO INSTAGRAM <Icon name="external" size={16} /></a></section>
      </main>

      <footer className="site-footer">
        <div className="footer-main page-width">
          <div className="footer-brand"><a className="brand brand-footer" href="#inicio"><Mark size={42} /><span>PULSO°</span></a><p>Estilo. Identidade.<br />Movimento.</p></div>
          <div className="footer-column"><p className="eyebrow">NAVEGUE</p><a href="#inicio">Início</a><a href="#categorias">Categorias</a><a href="#colecao">Coleção</a><a href="#sobre">Sobre a marca</a></div>
          <div className="footer-column"><p className="eyebrow">CONECTE-SE</p><a href={store.instagram} target="_blank" rel="noopener noreferrer">Instagram <Icon name="external" size={13} /></a><a href={store.whatsapp} target="_blank" rel="noopener noreferrer">Atendimento pelo WhatsApp <Icon name="external" size={13} /></a></div>
          <div className="footer-column"><p className="eyebrow">INFORMAÇÕES</p><span>Privacidade — em preparação</span><span>Trocas e devoluções — em preparação</span></div>
        </div>
        <div className="footer-bottom page-width"><span>© {new Date().getFullYear()} PULSO°. Todos os direitos reservados.</span><span>DEMONSTRAÇÃO VISUAL · CONFIRME A DISPONIBILIDADE PELO WHATSAPP</span><a href="#inicio">VOLTAR AO TOPO ↑</a></div>
      </footer>

      {notice ? <div className="toast" role="status"><Icon name="check" size={17} />{notice}</div> : null}

      {cartOpen ? <div className="drawer-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
        <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <div className="drawer-head"><div><p className="eyebrow">SUA SELEÇÃO</p><h2 id="cart-title">Carrinho <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fechar carrinho"><Icon name="close" /></button></div>
          <p className="drawer-demo-note">Pedido de demonstração. Confirme disponibilidade e condições com a loja.</p>
          {cart.length ? <>
            <div className="cart-items">{cart.map((line) => {
              const product = products.find((item) => item.id === line.productId);
              if (!product) return null;
              const key = lineKey(line);
              const options = [line.size && `Tam. ${line.size}`, line.color].filter(Boolean).join(" · ");
              const unit = wholesaleActive ? discountedPrice(product.price) : product.price;
              return <article className="cart-item" key={key}><div className="cart-thumb"><Icon name="image" size={22} /></div><div className="cart-item-info"><p className="eyebrow">{categories.find((category) => category.id === product.categoryId)?.name}</p><h3>{product.name}</h3>{options ? <p>{options}</p> : null}{wholesaleActive ? <del className="cart-original-subtotal">{money(product.price * line.quantity)}</del> : null}<strong>{money(unit * line.quantity)} <small>subtotal</small></strong><p className="cart-unit-price">Unitário: {wholesaleActive ? <><del>{money(product.price)}</del> <b>{money(unit)}</b> com desconto</> : money(product.price)}</p><div className="quantity-control"><button onClick={() => changeQuantity(key, -1)} aria-label={`Diminuir quantidade de ${product.name}`}><Icon name="minus" size={14} /></button><span>{line.quantity}</span><button onClick={() => changeQuantity(key, 1)} aria-label={`Aumentar quantidade de ${product.name}`}><Icon name="plus" size={14} /></button></div></div><button className="remove-item" onClick={() => removeLine(key)} aria-label={`Remover ${product.name}`}><Icon name="trash" size={17} /></button></article>;
            })}</div>
            <p className={`wholesale-status ${wholesaleActive ? "is-active" : ""}`}>{wholesaleActive ? "Preço de atacado ativado! Você economiza R$ 5,00 por peça." : `A partir de ${wholesaleThreshold} peças, você economiza R$ 5,00 por unidade.`}</p>
            <label className="observations-label" htmlFor="order-notes">Observações para a loja</label><textarea id="order-notes" value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Escreva aqui, se desejar" rows={3} />
            {wholesaleActive ? <div className="subtotal-row original-total"><span>Total original</span><del>{money(originalSubtotal)}</del></div> : null}<div className="subtotal-row savings-row"><span>Economia no atacado</span><strong>{money(totalSavings)}</strong></div><div className="subtotal-row"><span>Total estimado</span><strong>{money(subtotal)}</strong></div><p className="subtotal-caption">Confirme disponibilidade e condições com a loja pelo WhatsApp.</p>
            <button className="button button-dark checkout-button" onClick={checkout}>FINALIZAR PEDIDO PELO WHATSAPP <Icon name="arrow" size={17} /></button>
            <button className="continue-button" onClick={() => setCartOpen(false)}>CONTINUAR EXPLORANDO</button>
          </> : <div className="empty-cart"><div className="empty-bag"><Icon name="bag" size={28} /></div><h3>Seu carrinho está vazio.</h3><p>Escolha uma peça da coleção para adicioná-la ao carrinho.</p><button className="button button-dark" onClick={() => { setCartOpen(false); scrollTo("colecao"); }}>EXPLORAR COLEÇÃO <Icon name="arrow" size={16} /></button></div>}
        </aside>
      </div> : null}
    </>
  );
}
