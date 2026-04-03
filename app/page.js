'use client';
import { useState, useEffect } from 'react';

let splashHasPlayed = false;
import axios from 'axios';
import Link from 'next/link';
import LogoAnimado from '@/components/LogoAnimado';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

/* ─── Splash screen ─────────────────────────────────────────────────────── */
function Splash({ visible }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <LogoAnimado />
    </div>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #0a1628 0%, #000 70%)',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Blue glow orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(30,80,200,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Label */}
        <p className="text-white/40 text-xs tracking-[0.4em] uppercase mb-8">
          Colección 2026
        </p>

        {/* Headline */}
        <h1
          className="text-white font-black uppercase leading-none mb-6"
          style={{
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            fontFamily: "'Geist Sans', 'Arial Black', sans-serif",
            letterSpacing: '-0.02em',
            textShadow: '0 0 80px rgba(50,120,255,0.2)',
          }}
        >
          Nueva
          <br />
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>Temporada</span>
        </h1>

        {/* Subline */}
        <p className="text-white/50 text-base md:text-lg tracking-wide mb-12 max-w-md mx-auto">
          Moda urbana de alta calidad para dama y caballero. Cada prenda, una declaración. Los mejores precios para mayoristas
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/productos"
            className="px-10 py-4 bg-white text-black text-xs font-bold tracking-[0.3em] uppercase hover:bg-white/90 transition-colors"
          >
            Explorar colección
          </Link>
          <Link
            href="/productos?genero=dama"
            className="px-10 py-4 border border-white/30 text-white text-xs tracking-[0.3em] uppercase hover:border-white/60 hover:bg-white/5 transition-colors"
          >
            Colección dama
          </Link>
        </div>
      </div>


    </section>
  );
}

/* ─── Featured products ──────────────────────────────────────────────────── */
function FeaturedProducts() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/productos/destacados')
      .then((res) => setProductos(res.data))
      .catch(() => setError('No se pudieron cargar los productos destacados.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-[#050505] py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-3">Selección especial</p>
            <h2
              className="text-white font-black text-3xl md:text-4xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Productos destacados
            </h2>
          </div>
          <Link
            href="/productos"
            className="text-white/50 hover:text-white text-xs tracking-[0.3em] uppercase border-b border-white/20 hover:border-white/60 pb-0.5 transition-colors self-start md:self-auto"
          >
            Ver todos →
          </Link>
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#111] border border-white/10 animate-pulse">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="border border-white/10 p-8 text-center">
            <p className="text-white/40 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && productos.length === 0 && (
          <div className="border border-white/10 p-8 text-center">
            <p className="text-white/40 text-sm">Sin productos destacados por ahora.</p>
          </div>
        )}

        {!loading && !error && productos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productos.map((p) => (
              <ProductCard key={p.id ?? p._id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Banner strip ───────────────────────────────────────────────────────── */
function BannerStrip() {
  const items = ['Precios exclusivos para mayoristas', 'Devoluciones sin costo', 'Pago seguro', 'Colecciones exclusivas'];
  return (
    <div className="bg-white py-3 overflow-hidden">
      <div className="flex gap-16 whitespace-nowrap animate-[marquee_20s_linear_infinite]">
        {[...items, ...items].map((text, i) => (
          <span key={i} className="text-black text-xs tracking-[0.25em] uppercase font-medium shrink-0">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Gender callout ─────────────────────────────────────────────────────── */
function GenderCallout() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[50vh]">
      {[
        { label: 'Dama', query: 'dama', desc: 'Elegancia y estilo femenino', side: 'left' },
        { label: 'Caballero', query: 'caballero', desc: 'Moda masculina de vanguardia', side: 'right' },
      ].map(({ label, query, desc }) => (
        <Link
          key={query}
          href={`/productos?genero=${query}`}
          className="group relative flex items-end p-12 overflow-hidden bg-[#0a0a0a] border-white/10 border hover:bg-[#111] transition-colors"
        >
          {/* Decorative gradient */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 80%, rgba(20,60,180,0.12) 0%, transparent 70%)' }}
          />
          <div className="relative z-10">
            <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-2">{desc}</p>
            <h3
              className="text-white font-black text-4xl uppercase tracking-tight group-hover:text-white/80 transition-colors"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              {label}
            </h3>
            <span className="mt-4 inline-block text-white/40 group-hover:text-white text-xs tracking-[0.3em] uppercase border-b border-white/20 group-hover:border-white pb-0.5 transition-colors">
              Ver colección →
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (splashHasPlayed) {
      setSplashDone(true);
      return;
    }
    const t = setTimeout(() => {
      splashHasPlayed = true;
      setSplashDone(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Splash visible={!splashDone} />

      <div
        className="flex flex-col min-h-screen transition-opacity duration-700"
        style={{ opacity: splashDone ? 1 : 0 }}
      >
        <Navbar />
        <main className="flex-1 pt-16">
          <Hero />
          <BannerStrip />
          <FeaturedProducts />
          <GenderCallout />
        </main>
        <Footer />
      </div>
    </>
  );
}
