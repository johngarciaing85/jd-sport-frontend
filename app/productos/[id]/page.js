'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCarrito } from '@/lib/carrito';

/* ─── Image gallery ─────────────────────────────────────────────────────── */
function Gallery({ imagenes, nombre }) {
  const [active, setActive] = useState(0);
  const imgs = Array.isArray(imagenes) && imagenes.length > 0 ? imagenes : null;
  const single = !imgs;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-[4/5] bg-[#111] border border-white/10 overflow-hidden relative">
        {imgs ? (
          <img
            src={imgs[active]}
            alt={nombre}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-white/10 text-8xl font-black select-none"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              JD
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {!single && imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-20 border overflow-hidden transition-colors ${
                i === active ? 'border-white' : 'border-white/15 hover:border-white/40'
              }`}
            >
              <img src={src} alt={`${nombre} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Size selector ─────────────────────────────────────────────────────── */
function SizeSelector({ tallas = [], selected, onSelect }) {
  if (!tallas.length) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Talla</p>
        {selected && (
          <span className="text-white/60 text-xs tracking-wide">{selected}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tallas.map((t) => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`min-w-[44px] h-11 px-3 border text-sm font-medium transition-all ${
              selected === t
                ? 'bg-white text-black border-white'
                : 'border-white/20 text-white/60 hover:border-white/60 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Quantity control ───────────────────────────────────────────────────── */
function QuantityControl({ value, onChange }) {
  return (
    <div className="flex items-center border border-white/20 w-fit">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors text-lg"
        aria-label="Reducir cantidad"
      >
        −
      </button>
      <span className="w-12 text-center text-white text-sm font-medium">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors text-lg"
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
      <div className="aspect-[4/5] bg-white/5" />
      <div className="flex flex-col gap-6 pt-4">
        <div className="h-4 bg-white/5 rounded w-1/4" />
        <div className="h-8 bg-white/5 rounded w-3/4" />
        <div className="h-6 bg-white/5 rounded w-1/3" />
        <div className="space-y-2 mt-4">
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-5/6" />
          <div className="h-3 bg-white/5 rounded w-4/6" />
        </div>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-11 h-11 bg-white/5" />
          ))}
        </div>
        <div className="h-12 bg-white/5 rounded mt-2" />
      </div>
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ show }) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 transition-all duration-300"
      style={{ opacity: show ? 1 : 0, transform: `translateX(-50%) translateY(${show ? 0 : '12px'})`, pointerEvents: 'none' }}
    >
      ✓ Agregado al carrito
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ProductoDetalle() {
  const { id } = useParams();
  const router = useRouter();
  const agregar = useCarrito((s) => s.agregar);

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [talla, setTalla] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [tallaError, setTallaError] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/productos/${id}/`)
      .then((res) => setProducto(res.data))
      .catch(() => setError('Producto no encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAgregar = () => {
    const tallas = producto?.tallas ?? [];
    if (tallas.length > 0 && !talla) {
      setTallaError(true);
      return;
    }
    agregar(producto, talla ?? 'Única', cantidad);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handleComprarAhora = () => {
    handleAgregar();
    router.push('/carrito');
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <Toast show={toast} />

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/30 text-xs tracking-wide mb-10">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/productos" className="hover:text-white transition-colors">Productos</Link>
            {producto && (
              <>
                <span>/</span>
                <span className="text-white/60 truncate max-w-[200px]">{producto.nombre}</span>
              </>
            )}
          </nav>

          {loading && <Skeleton />}

          {error && (
            <div className="border border-white/10 p-12 text-center">
              <p className="text-white/40 text-sm mb-4">{error}</p>
              <Link
                href="/productos"
                className="text-xs tracking-[0.2em] uppercase border border-white/20 px-6 py-2 text-white/60 hover:text-white transition-colors"
              >
                Volver al catálogo
              </Link>
            </div>
          )}

          {!loading && !error && producto && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
              {/* Gallery */}
              <Gallery
                imagenes={producto.imagenes ?? (producto.imagen ? [producto.imagen] : [])}
                nombre={producto.nombre}
              />

              {/* Info */}
              <div className="flex flex-col gap-6">
                {/* Category + gender badges */}
                <div className="flex items-center gap-2">
                  {producto.categoria && (
                    <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase border border-white/15 px-2.5 py-1">
                      {producto.categoria}
                    </span>
                  )}
                  {producto.genero && (
                    <span className="text-blue-400/70 text-[10px] tracking-[0.3em] uppercase border border-blue-500/20 px-2.5 py-1">
                      {producto.genero}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1
                  className="text-white font-black text-3xl md:text-4xl uppercase tracking-tight leading-tight"
                  style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
                >
                  {producto.nombre}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-white text-3xl font-bold">
                    ${Number(producto.precio).toLocaleString('es-CO')}
                  </span>
                  {producto.precio_original && producto.precio_original > producto.precio && (
                    <span className="text-white/30 text-lg line-through">
                      ${Number(producto.precio_original).toLocaleString('es-CO')}
                    </span>
                  )}
                </div>

                {/* Description */}
                {producto.descripcion && (
                  <p className="text-white/50 text-sm leading-7 border-t border-white/10 pt-6">
                    {producto.descripcion}
                  </p>
                )}

                {/* Size selector */}
                {(producto.tallas?.length > 0) && (
                  <div>
                    <SizeSelector
                      tallas={producto.tallas}
                      selected={talla}
                      onSelect={(t) => { setTalla(t); setTallaError(false); }}
                    />
                    {tallaError && (
                      <p className="text-red-400 text-xs mt-2 tracking-wide">
                        Por favor selecciona una talla.
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-3">Cantidad</p>
                  <QuantityControl value={cantidad} onChange={setCantidad} />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAgregar}
                    className="flex-1 py-4 border border-white/30 text-white text-xs font-bold tracking-[0.3em] uppercase hover:border-white hover:bg-white/5 transition-all"
                  >
                    Agregar al carrito
                  </button>
                  <button
                    onClick={handleComprarAhora}
                    className="flex-1 py-4 bg-white text-black text-xs font-bold tracking-[0.3em] uppercase hover:bg-white/90 transition-colors"
                  >
                    Comprar ahora
                  </button>
                </div>

                {/* Trust signals */}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                  {[
                    'Envío gratis en compras mayores a $50',
                    'Devoluciones sin costo dentro de 30 días',
                    'Pago 100% seguro con Wompi',
                  ].map((text) => (
                    <p key={text} className="text-white/30 text-xs tracking-wide flex items-center gap-2">
                      <span className="text-white/20">✓</span> {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
