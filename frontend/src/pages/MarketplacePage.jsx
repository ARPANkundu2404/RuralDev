// src/pages/MarketplacePage.jsx
import React, { useState } from "react";
import { PRODUCTS } from "../data/mockData";
import { Stars, FilterTabs, SectionHeader, Toast } from "../components/UI";

const CATEGORIES = ["All", "Textile", "Pottery", "Farming", "Bamboo", "Art"];

function TrendingCard({ product, onBuy, inCart }) {
  return (
    <div
      className="relative shrink-0 w-52 card border border-saffron-500/15 overflow-hidden group cursor-pointer"
      style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(15,21,37,0.9) 60%)" }}
      onClick={() => !inCart && onBuy(product)}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)" }}
      />

      <div className="p-4">
        <span className="badge-review text-[10px] mb-3 inline-block">
          {product.tag || "🔥 Trending"}
        </span>
        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300 text-center">
          {product.emoji}
        </div>
        <h4 className="font-ui text-sm font-semibold text-white leading-snug mb-1">
          {product.name}
        </h4>
        <p className="text-xs text-ink-muted mb-3">{product.seller}</p>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold text-gradient-gold">
            ₹{product.price}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onBuy(product); }}
            className={inCart
              ? "text-[10px] px-2.5 py-1 rounded-full bg-jade-500/20 text-jade-400 font-semibold border border-jade-500/30"
              : "text-[10px] px-2.5 py-1 rounded-full bg-saffron-500 text-night-950 font-bold hover:bg-saffron-400 transition-colors"
            }
          >
            {inCart ? "✓ Added" : "Buy"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onBuy, inCart, style }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`card border flex flex-col overflow-hidden group cursor-pointer ${
        hover ? "border-saffron-500/30 shadow-card-hover" : "border-white/6"
      }`}
      style={{ ...style, transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !inCart && onBuy(product)}
    >
      {/* Image area */}
      <div
        className="h-36 flex items-center justify-center relative"
        style={{
          background: "linear-gradient(135deg, #151d33 0%, #0f1525 100%)",
        }}
      >
        <span
          className="text-6xl transition-transform duration-400 group-hover:scale-125"
        >
          {product.emoji}
        </span>
        {product.tag && (
          <div className="absolute top-2.5 left-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-ui
              ${product.tag === "Bestseller" ? "bg-saffron-500 text-night-950" :
                product.tag === "New" ? "bg-jade-500 text-night-950" :
                "bg-rose-500 text-white"}`}
            >
              {product.tag}
            </span>
          </div>
        )}
        {inCart && (
          <div className="absolute inset-0 bg-night-900/70 flex items-center justify-center">
            <span className="text-jade-400 text-3xl">✓</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-ink-muted font-ui">
          {product.category}
        </div>
        <h4 className="font-ui text-sm font-semibold text-ink leading-snug">
          {product.name}
        </h4>
        <div className="text-xs text-ink-muted">by {product.seller}</div>
        <Stars rating={product.sellerRating} />
        <span className="text-[10px] text-ink-muted font-ui">
          {product.reviews} reviews
        </span>

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-white">
            ₹{product.price}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onBuy(product); }}
            disabled={inCart}
            className={inCart
              ? "px-3 py-1.5 rounded-lg text-xs font-semibold font-ui bg-jade-500/15 text-jade-400 border border-jade-500/20 cursor-default"
              : "btn-gold text-xs px-3 py-1.5"
            }
          >
            {inCart ? "✓ In Cart" : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState(new Set());
  const [toast, setToast] = useState(null);

  const trending = PRODUCTS.filter((p) => p.trending);
  const allFiltered =
    category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  const handleBuy = (product) => {
    if (cart.has(product.id)) return;
    setCart((prev) => new Set([...prev, product.id]));
    setToast({ message: `"${product.name}" added to cart!`, type: "success" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <SectionHeader
          label="Rural Marketplace"
          title="Handcrafted Goods"
          subtitle="Direct from artisans. Zero middlemen. Every purchase supports rural income."
        />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🛒</span>
          <span className="font-display text-xl font-bold text-saffron-400">{cart.size}</span>
          <span className="text-xs text-ink-muted font-ui">in cart</span>
        </div>
      </div>

      {/* ── Trending section ── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-display text-xl font-semibold text-white">🔥 Trending Now</h2>
          <span className="badge-review">Hot picks</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
          {trending.map((p) => (
            <TrendingCard
              key={p.id}
              product={p}
              onBuy={handleBuy}
              inCart={cart.has(p.id)}
            />
          ))}
        </div>
      </section>

      {/* ── All products ── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-xl font-semibold text-white">All Products</h2>
          <FilterTabs tabs={CATEGORIES} active={category} onChange={setCategory} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {allFiltered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuy={handleBuy}
              inCart={cart.has(product.id)}
              style={{
                animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
                animationDelay: `${i * 0.06}s`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            />
          ))}
        </div>

        {allFiltered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-ink font-semibold">No products in this category</p>
            <p className="text-ink-muted text-sm mt-1">Try another category above</p>
          </div>
        )}
      </section>
    </div>
  );
}