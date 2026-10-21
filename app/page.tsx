"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { categories, products, store, type Product } from "@/data/products";

type CartLine = { productId: string; modelIndex: number; quantity: number; size: string };
type CouponCode = "pulso5" | "influ10";
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
const lineKey = (line: CartLine) => `${line.productId}|${line.modelIndex}|${line.size}`;
const defaultSizes = ["P", "M", "G"] as const;
const sizesFor = (product: Product) => product.sizes ?? defaultSizes;
const modelKey = (productId: string, modelIndex: number) => `${productId}|${modelIndex}`;
const quantityKey = (productId: string, modelIndex: number, size: string) => `${modelKey(productId, modelIndex)}|${size}`;
const wholesaleThreshold = 4;
const wholesaleDiscount = 5;
const discountedPrice = (price: number) => Math.max(0, price - wholesaleDiscount);
const couponDefinitions: Record<CouponCode, { percent: number; expiresAt: number | null }> = {
  pulso5: { percent: 5, expiresAt: new Date("2026-10-24T02:41:25.000Z").getTime() },
  influ10: { percent: 10, expiresAt: null },
};
const couponExpiryLabel = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
}).format(couponDefinitions.pulso5.expiresAt!);
const isCouponCode = (value: string): value is CouponCode => value === "pulso5" || value === "influ10";
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

function ProductCard({ product, selectedModels, quantities, onSelectModel, onChangeDraftQuantity, onShowAllModels, onAdd, focusable = true }: {
  product: Product;
  selectedModels: Record<string, number>;
  quantities: Record<string, number>;
  onSelectModel: (product: Product, modelIndex: number) => void;
  onChangeDraftQuantity: (productId: string, modelIndex: number, size: string, amount: number) => void;
  onShowAllModels: (product: Product) => void;
  onAdd: (product: Product) => void;
  focusable?: boolean;
}) {
  const category = categories.find((item) => item.id === product.categoryId)?.name;
  const images = product.images ?? [];
  const imageIndex = images.length === 1 ? 0 : (selectedModels[product.id] ?? -1);
  const displayedImageIndex = imageIndex >= 0 ? imageIndex : 0;
  const changeImage = (direction: -1 | 1) => {
    if (images.length < 2) return;
    onSelectModel(product, (displayedImageIndex + direction + images.length) % images.length);
  };
  const hasModel = imageIndex >= 0;
  const previewCount = 4;
  const modelLabel = (index: number) => `Modelo ${String(index + 1).padStart(2, "0")}`;
  return (
    <article className="product-card">
      <div className="product-photo">{images[displayedImageIndex] ? <Image className="product-image" src={images[displayedImageIndex]} alt={`${product.name}, ${modelLabel(displayedImageIndex)}`} fill sizes="(max-width: 760px) 76vw, 278px" /> : <Placeholder label="FOTO REAL EM BREVE" />}{product.availability === "coming-soon" ? <span className="product-status-badge">Em breve</span> : null}</div>
      <div className="product-gallery-controls" aria-label={`Galeria de ${product.name}`}>
        <button type="button" className="gallery-previous" aria-label={`Foto anterior de ${product.name}`} tabIndex={focusable ? 0 : -1} disabled={images.length < 2} onClick={() => changeImage(-1)}><Icon name="arrow" size={15} /></button>
        <span aria-live={focusable ? "polite" : undefined}>{images.length ? `${hasModel ? modelLabel(displayedImageIndex) : "Escolha um modelo"} · ${String(displayedImageIndex + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}` : "FOTO EM BREVE"}</span>
        <button type="button" className="gallery-next" aria-label={`Próxima foto de ${product.name}`} tabIndex={focusable ? 0 : -1} disabled={images.length < 2} onClick={() => changeImage(1)}><Icon name="arrow" size={15} /></button>
      </div>
      <div className="product-info">
        <p className="eyebrow product-category">{category}</p>
        <h3>{product.name}</h3>
        {product.availability === "coming-soon" ? <p className="product-availability" role="status">Em breve</p> : <>
        <p className="product-price">{money(product.price)}</p>
        <p className="wholesale-hint">Compre 4 peças ou mais e pague R$ 5,00 a menos por peça.</p>
        <div className="model-picker">
          <div className="model-picker-heading"><span>1. Escolha o modelo</span>{images.length > previewCount ? <button type="button" onClick={() => onShowAllModels(product)} tabIndex={focusable ? 0 : -1}>Ver mais</button> : null}</div>
          {images.length ? <div className="model-strip" aria-label={`Modelos de ${product.name}`}>
            {images.slice(0, previewCount).map((src, index) => <button type="button" className={`model-option ${displayedImageIndex === index && hasModel ? "is-selected" : ""}`} key={src} aria-pressed={displayedImageIndex === index && hasModel} aria-label={`Selecionar ${modelLabel(index)} de ${product.name}`} tabIndex={focusable ? 0 : -1} onClick={() => onSelectModel(product, index)}>
              <span className="model-option-image"><Image src={src} alt="" fill sizes="70px" /></span><span>{modelLabel(index)}</span>
            </button>)}
            {!images.length ? <Placeholder label="FOTO REAL EM BREVE" /> : null}
          </div> : <div className="model-empty"><Placeholder label="FOTO REAL EM BREVE" /></div>}
        </div>
        <div className="size-quantity-section">
          <h4>2. Escolha tamanho e quantidade</h4>
          {hasModel ? <div className="size-quantity-grid">{sizesFor(product).map((size) => {
            const key = quantityKey(product.id, displayedImageIndex, size);
            const quantity = quantities[key] ?? 0;
            return <div className="size-quantity" key={size}>
              <span className="size-label">{size}</span>
              <button type="button" aria-label={`Diminuir ${size} de ${product.name}`} disabled={quantity === 0} tabIndex={focusable ? 0 : -1} onClick={() => onChangeDraftQuantity(product.id, displayedImageIndex, size, -1)}><Icon name="minus" size={16} /></button>
              <output aria-label={`${size}, quantidade ${quantity}`}>{quantity}</output>
              <button type="button" aria-label={`Aumentar ${size} de ${product.name}`} tabIndex={focusable ? 0 : -1} onClick={() => onChangeDraftQuantity(product.id, displayedImageIndex, size, 1)}><Icon name="plus" size={16} /></button>
            </div>;
          })}</div> : <p className="choose-model-note">Escolha um modelo.</p>}
        </div>
        <button className="button button-dark add-button" type="button" tabIndex={focusable ? 0 : -1} onClick={() => onAdd(product)}>ADICIONAR AO CARRINHO <Icon name="plus" size={16} /></button>
        </>}
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
  const [selectedModels, setSelectedModels] = useState<Record<string, number>>({});
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({});
  const [modelsDialogProduct, setModelsDialogProduct] = useState<Product | null>(null);
  const [observations, setObservations] = useState("");
  const [notice, setNotice] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<CouponCode | null>(null);
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("pulso-demo-cart") || "[]") as CartLine[];
      const valid = Array.isArray(saved) ? saved.filter((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product && product.availability !== "coming-soon" && Number.isInteger(line.quantity) && line.quantity > 0 && Number.isInteger(line.modelIndex) && line.modelIndex >= 0 && line.modelIndex < (product.images?.length ?? 0) && sizesFor(product).some((size) => size === line.size);
      }) : [];
      setCart(valid);
      const savedCoupon = window.localStorage.getItem("pulso-demo-coupon") || "";
      if (isCouponCode(savedCoupon) && (!couponDefinitions[savedCoupon].expiresAt || Date.now() < couponDefinitions[savedCoupon].expiresAt!)) {
        setAppliedCouponCode(savedCoupon);
        setCouponInput(savedCoupon);
      } else {
        window.localStorage.removeItem("pulso-demo-coupon");
      }
    } catch { setCart([]); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("pulso-demo-cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (appliedCouponCode) window.localStorage.setItem("pulso-demo-coupon", appliedCouponCode);
    else window.localStorage.removeItem("pulso-demo-coupon");
  }, [appliedCouponCode, hydrated]);

  useEffect(() => {
    if (!appliedCouponCode) return;
    const expiresAt = couponDefinitions[appliedCouponCode].expiresAt;
    if (!expiresAt) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      setAppliedCouponCode(null);
      setCouponMessage("O cupom PULSO5 expirou.");
      return;
    }
    const timeout = window.setTimeout(() => {
      setAppliedCouponCode(null);
      setCouponMessage("O cupom PULSO5 expirou.");
    }, remaining);
    return () => window.clearTimeout(timeout);
  }, [appliedCouponCode]);

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

  useEffect(() => {
    if (!modelsDialogProduct) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setModelsDialogProduct(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modelsDialogProduct]);

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
  const appliedCoupon = appliedCouponCode ? couponDefinitions[appliedCouponCode] : null;
  const couponDiscount = appliedCoupon && (!appliedCoupon.expiresAt || Date.now() < appliedCoupon.expiresAt)
    ? Math.round(subtotal * appliedCoupon.percent) / 100
    : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectCategory = (id: string) => {
    setActiveCategory(id);
    setSearch("");
    scrollTo("colecao");
  };

  const selectModel = (product: Product, modelIndex: number) => {
    setSelectedModels((current) => ({ ...current, [product.id]: modelIndex }));
  };

  const changeDraftQuantity = (productId: string, modelIndex: number, size: string, amount: number) => {
    const key = quantityKey(productId, modelIndex, size);
    setDraftQuantities((current) => ({ ...current, [key]: Math.max(0, (current[key] ?? 0) + amount) }));
  };

  const addToCart = (product: Product) => {
    if (product.availability === "coming-soon") return;
    const modelIndex = product.images?.length === 1 ? 0 : selectedModels[product.id];
    if (modelIndex === undefined || modelIndex < 0 || modelIndex >= (product.images?.length ?? 0)) {
      setNotice("Escolha um modelo para continuar.");
      window.setTimeout(() => setNotice(""), 2800);
      return;
    }
    const sizes = sizesFor(product);
    const additions = sizes.flatMap((size) => {
      const quantity = draftQuantities[quantityKey(product.id, modelIndex, size)] ?? 0;
      return quantity > 0 ? [{ productId: product.id, modelIndex, quantity, size }] : [];
    });
    if (!additions.length) {
      setNotice("Escolha ao menos uma quantidade para continuar.");
      window.setTimeout(() => setNotice(""), 2800);
      return;
    }
    setCart((current) => additions.reduce((next, added) => {
      const existing = next.find((line) => lineKey(line) === lineKey(added));
      return existing ? next.map((line) => lineKey(line) === lineKey(added) ? { ...line, quantity: line.quantity + added.quantity } : line) : [...next, added];
    }, current));
    setDraftQuantities((current) => {
      const next = { ...current };
      sizes.forEach((size) => { delete next[quantityKey(product.id, modelIndex, size)]; });
      return next;
    });
    setNotice(`${additions.reduce((total, line) => total + line.quantity, 0)} peça(s) adicionada(s) ao carrinho.`);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const changeQuantity = (key: string, amount: number) => setCart((current) => current.map((line) => lineKey(line) === key ? { ...line, quantity: Math.max(1, line.quantity + amount) } : line));
  const removeLine = (key: string) => setCart((current) => current.filter((line) => lineKey(line) !== key));

  const applyCoupon = () => {
    const code = couponInput.trim().toLowerCase();
    if (!isCouponCode(code)) {
      setCouponMessage("Cupom inválido. Confira o código e tente novamente.");
      return;
    }
    const coupon = couponDefinitions[code];
    if (coupon.expiresAt && Date.now() >= coupon.expiresAt) {
      setAppliedCouponCode(null);
      setCouponMessage("O cupom PULSO5 expirou.");
      return;
    }
    setAppliedCouponCode(code);
    setCouponMessage(code === "pulso5"
      ? `Cupom PULSO5 aplicado: 5% de desconto até ${couponExpiryLabel}.`
      : "Cupom INFLU10 aplicado: 10% de desconto, sem prazo de validade.");
  };

  const removeCoupon = () => {
    setAppliedCouponCode(null);
    setCouponMessage("Cupom removido.");
  };

  const checkout = () => {
    if (!cart.length) return;
    const detail = cart.map((line) => {
      const product = products.find((item) => item.id === line.productId)!;
      const unit = wholesaleActive ? discountedPrice(product.price) : product.price;
      const model = `Modelo ${String(line.modelIndex + 1).padStart(2, "0")}`;
      return `- ${product.name}\n  ${model} · Tamanho: ${line.size}\n  Quantidade: ${line.quantity}\n  Preço original por unidade: ${money(product.price)}\n  Preço por unidade com desconto: ${money(unit)}\n  Subtotal: ${money(unit * line.quantity)}`;
    }).join("\n\n");
    const couponSummary = appliedCouponCode
      ? `Cupom aplicado: ${appliedCouponCode.toUpperCase()} (${appliedCoupon?.percent ?? 0}%)\nDesconto do cupom: ${money(couponDiscount)}`
      : "Cupom aplicado: nenhum";
    const message = `Olá! Gostaria de fazer um pedido na ${store.name}.\n\nMeu pedido:\n\n${detail}\n\nQuantidade total: ${cartCount} peça(s)\nSubtotal original: ${money(originalSubtotal)}\nDesconto de atacado: ${money(totalSavings)}\n${couponSummary}\nTotal final: ${money(finalTotal)}\n\nObservações: ${observations.trim() || "(escreva aqui, se desejar)"}\n\nGostaria de confirmar a disponibilidade e as condições de compra.`;
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
            <a className="whatsapp-nav-button" href={store.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Falar diretamente com a PULSO° pelo WhatsApp"><Icon name="chat" size={17} /><span>WhatsApp</span></a>
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
                <div className="product-set" aria-hidden="true">{filteredProducts.map((product) => <ProductCard key={`copy-${product.id}`} product={product} selectedModels={selectedModels} quantities={draftQuantities} onSelectModel={selectModel} onChangeDraftQuantity={changeDraftQuantity} onShowAllModels={setModelsDialogProduct} onAdd={addToCart} focusable={false} />)}</div>
                <div className="product-set">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} selectedModels={selectedModels} quantities={draftQuantities} onSelectModel={selectModel} onChangeDraftQuantity={changeDraftQuantity} onShowAllModels={setModelsDialogProduct} onAdd={addToCart} />)}</div>
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

      {modelsDialogProduct ? <div className="models-dialog-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModelsDialogProduct(null); }}>
        <section className="models-dialog" role="dialog" aria-modal="true" aria-labelledby="models-dialog-title">
          <div className="models-dialog-head"><div><p className="eyebrow">SELEÇÃO DE FOTOS</p><h2 id="models-dialog-title">Modelos · {modelsDialogProduct.name}</h2></div><button className="icon-button" type="button" aria-label="Fechar modelos" onClick={() => setModelsDialogProduct(null)}><Icon name="close" /></button></div>
          <p className="models-dialog-note">Escolha a foto que representa a peça desejada.</p>
          <div className="models-dialog-grid">{(modelsDialogProduct.images ?? []).map((src, index) => <button type="button" className={`model-option ${selectedModels[modelsDialogProduct.id] === index ? "is-selected" : ""}`} key={src} aria-pressed={selectedModels[modelsDialogProduct.id] === index} onClick={() => { selectModel(modelsDialogProduct, index); setModelsDialogProduct(null); }}>
            <span className="model-option-image"><Image src={src} alt="" fill sizes="(max-width: 760px) 35vw, 150px" /></span><span>Modelo {String(index + 1).padStart(2, "0")}</span>
          </button>)}</div>
        </section>
      </div> : null}

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
              const options = [`Modelo ${String(line.modelIndex + 1).padStart(2, "0")}`, `Tam. ${line.size}`].join(" · ");
              const unit = wholesaleActive ? discountedPrice(product.price) : product.price;
              const selectedImage = product.images?.[line.modelIndex];
              return <article className="cart-item" key={key}><div className="cart-thumb">{selectedImage ? <Image src={selectedImage} alt={`${product.name}, ${options}`} fill sizes="76px" /> : <Icon name="image" size={22} />}</div><div className="cart-item-info"><p className="eyebrow">{categories.find((category) => category.id === product.categoryId)?.name}</p><h3>{product.name}</h3><p>{options}</p>{wholesaleActive ? <del className="cart-original-subtotal">{money(product.price * line.quantity)}</del> : null}<strong>{money(unit * line.quantity)} <small>subtotal</small></strong><p className="cart-unit-price">Unitário: {wholesaleActive ? <><del>{money(product.price)}</del> <b>{money(unit)}</b> com desconto</> : money(product.price)}</p><div className="quantity-control"><button onClick={() => changeQuantity(key, -1)} aria-label={`Diminuir quantidade de ${product.name}, ${options}`}><Icon name="minus" size={14} /></button><span>{line.quantity}</span><button onClick={() => changeQuantity(key, 1)} aria-label={`Aumentar quantidade de ${product.name}, ${options}`}><Icon name="plus" size={14} /></button></div></div><button className="remove-item" onClick={() => removeLine(key)} aria-label={`Remover ${product.name}, ${options}`}><Icon name="trash" size={17} /></button></article>;
            })}</div>
            <p className={`wholesale-status ${wholesaleActive ? "is-active" : ""}`}>{wholesaleActive ? "Preço de atacado ativado! Você economiza R$ 5,00 por peça." : `A partir de ${wholesaleThreshold} peças, você economiza R$ 5,00 por unidade.`}</p>
            <form className="coupon-form" onSubmit={(event) => { event.preventDefault(); applyCoupon(); }}>
              <label htmlFor="coupon-code">Cupom de desconto</label>
              <div className="coupon-input-row"><input id="coupon-code" type="text" value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Digite seu cupom" autoComplete="off" autoCapitalize="none" /><button type="submit">Aplicar</button></div>
              {couponMessage ? <p className="coupon-message" role="status" aria-live="polite">{couponMessage}</p> : null}
              {appliedCouponCode ? <button className="coupon-remove" type="button" onClick={removeCoupon}>Remover cupom</button> : null}
            </form>
            <label className="observations-label" htmlFor="order-notes">Observações para a loja</label><textarea id="order-notes" value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Escreva aqui, se desejar" rows={3} />
            <div className="subtotal-row"><span>Subtotal original</span><strong>{money(originalSubtotal)}</strong></div><div className="subtotal-row pieces-row"><span>Quantidade total</span><strong>{cartCount} peça(s)</strong></div><div className="subtotal-row savings-row"><span>Desconto de atacado</span><strong>{money(totalSavings)}</strong></div><div className="subtotal-row coupon-savings-row"><span>Desconto do cupom</span><strong>{money(couponDiscount)}</strong></div><div className="subtotal-row final-total"><span>Total final</span><strong>{money(finalTotal)}</strong></div><p className="subtotal-caption">Confirme disponibilidade e condições com a loja pelo WhatsApp.</p>
            <button className="button button-dark checkout-button" onClick={checkout}>FINALIZAR PEDIDO PELO WHATSAPP <Icon name="arrow" size={17} /></button>
            <button className="continue-button" onClick={() => setCartOpen(false)}>CONTINUAR EXPLORANDO</button>
          </> : <div className="empty-cart"><div className="empty-bag"><Icon name="bag" size={28} /></div><h3>Seu carrinho está vazio.</h3><p>Escolha uma peça da coleção para adicioná-la ao carrinho.</p><button className="button button-dark" onClick={() => { setCartOpen(false); scrollTo("colecao"); }}>EXPLORAR COLEÇÃO <Icon name="arrow" size={16} /></button></div>}
        </aside>
      </div> : null}
    </>
  );
}
