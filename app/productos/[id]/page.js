'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCarrito } from '@/lib/carrito';
import { useAuth } from '@/lib/auth';

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
// tallas: array of strings OR array of {talla, stock, disponible}
function SizeSelector({ tallas = [], selected, onSelect }) {
  if (!tallas.length) return null;

  // Normalise: always work with {talla, disabled} objects
  const items = tallas.map((t) =>
    typeof t === 'string'
      ? { talla: t, disabled: false }
      : { talla: t.talla, disabled: t.stock === 0 || t.disponible === false }
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase">Talla</p>
        {selected && (
          <span className="text-white/60 text-xs tracking-wide">{selected}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(({ talla, disabled }) => (
          <button
            key={talla}
            onClick={() => !disabled && onSelect(talla)}
            disabled={disabled}
            title={disabled ? 'Sin stock' : undefined}
            className={`min-w-[44px] h-11 px-3 border text-sm font-medium transition-all relative ${
              disabled
                ? 'border-white/10 text-white/20 cursor-not-allowed'
                : selected === talla
                  ? 'bg-white text-black border-white'
                  : 'border-white/20 text-white/60 hover:border-white/60 hover:text-white'
            }`}
          >
            {disabled ? <s>{talla}</s> : talla}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Quantity control ───────────────────────────────────────────────────── */
function QuantityControl({ value, onChange, max = 99 }) {
  const atMax = value >= max;
  const disabled = max === 0;
  return (
    <div className="flex items-center border border-white/20 w-fit">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled}
        className={`w-11 h-11 flex items-center justify-center transition-colors text-lg ${
          disabled ? 'text-white/15 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
        aria-label="Reducir cantidad"
      >
        −
      </button>
      <span className="w-12 text-center text-white text-sm font-medium">{disabled ? 0 : value}</span>
      <button
        onClick={() => onChange(Math.min(value + 1, max))}
        disabled={atMax || disabled}
        className={`w-11 h-11 flex items-center justify-center transition-colors text-lg ${
          atMax || disabled ? 'text-white/15 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
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

/* ─── Stars display ─────────────────────────────────────────────────────── */
function Stars({ value, max = 5, size = 14, interactive = false, onSelect }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onSelect?.(i + 1)}
          className={interactive ? 'cursor-pointer' : 'cursor-default pointer-events-none'}
          aria-label={interactive ? `${i + 1} estrellas` : undefined}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={i < value ? '#facc15' : 'none'}
            stroke={i < value ? '#facc15' : 'rgba(255,255,255,0.2)'}
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ─── Reviews ────────────────────────────────────────────────────────────── */
function Resenas({ productoId }) {
  const { token } = useAuth();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState(null);

  const cargar = () => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios
      .get(`http://localhost:8000/api/productos/${productoId}/resenas`, { headers })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [productoId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(
        `http://localhost:8000/api/productos/${productoId}/resenas`,
        { estrellas, comentario: comentario.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormOpen(false);
      setComentario('');
      setEstrellas(5);
      cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo enviar la reseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-white/10 pt-12 mt-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-2">Opiniones</p>
          <div className="flex items-center gap-3">
            <h2
              className="text-white font-black text-2xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Reseñas
            </h2>
            {!loading && data?.promedio && (
              <div className="flex items-center gap-2">
                <Stars value={Math.round(data.promedio)} />
                <span className="text-white/50 text-sm">
                  {data.promedio.toFixed(1)} ({data.total})
                </span>
              </div>
            )}
          </div>
        </div>
        {!loading && data?.puede_resenas && !formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="text-xs tracking-[0.25em] uppercase border border-white/20 px-4 py-2.5 text-white/60 hover:text-white hover:border-white/50 transition-colors"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="border border-white/15 bg-[#0a0a0a] p-6 mb-8 flex flex-col gap-4"
        >
          <p className="text-white/40 text-xs tracking-[0.3em] uppercase">Tu reseña</p>

          <div>
            <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">Calificación</p>
            <Stars value={estrellas} size={22} interactive onSelect={setEstrellas} />
          </div>

          <div>
            <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Cuéntanos tu experiencia con este producto..."
              className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs tracking-wide">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setFormOpen(false); setError(null); }}
              disabled={submitting}
              className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Enviando...' : 'Publicar reseña'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-white/8 p-5 animate-pulse">
              <div className="flex gap-2 mb-3">
                {[1,2,3,4,5].map(s => <div key={s} className="w-3.5 h-3.5 bg-white/10 rounded-sm" />)}
              </div>
              <div className="h-3 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && data?.resenas?.length === 0 && (
        <div className="border border-white/8 p-10 text-center">
          <p className="text-white/25 text-sm tracking-wide">
            Aún no hay reseñas para este producto.
          </p>
          {data.puede_resenas && !formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="mt-4 text-white/40 hover:text-white text-xs tracking-[0.25em] uppercase underline underline-offset-4 transition-colors"
            >
              Sé el primero en opinar →
            </button>
          )}
        </div>
      )}

      {!loading && data?.resenas?.length > 0 && (
        <div className="flex flex-col gap-4">
          {data.resenas.map((r) => (
            <div key={r.id} className="border border-white/8 bg-[#080808] p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Stars value={r.estrellas} size={13} />
                  <span className="text-white/60 text-xs font-medium tracking-wide">{r.nombre_usuario}</span>
                </div>
                <span className="text-white/20 text-[10px] tracking-wide">
                  {new Date(r.creado_en).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {r.comentario && (
                <p className="text-white/50 text-sm leading-relaxed">{r.comentario}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Related products ───────────────────────────────────────────────────── */
function RelatedProducts({ categoriaId, categoriaNombre, currentId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!categoriaId) return;
    axios
      .get(`http://localhost:8000/api/productos/?categoria_id=${categoriaId}&tamano=4`)
      .then((r) => {
        const items = Array.isArray(r.data) ? r.data : (r.data?.items ?? r.data?.productos ?? []);
        setProducts(items.filter((p) => String(p.id) !== String(currentId)).slice(0, 4));
      })
      .catch(() => {});
  }, [categoriaId, currentId]);

  if (!products.length) return null;

  return (
    <section className="border-t border-white/10 pt-12 mt-4">
      <div className="mb-8">
        <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-2">
          {categoriaNombre ?? 'Misma categoría'}
        </p>
        <h2
          className="text-white font-black text-2xl uppercase tracking-tight"
          style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
        >
          También te puede interesar
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ProductoDetalle() {
  const { id } = useParams();
  const router = useRouter();
  const agregar = useCarrito((s) => s.agregar);

  const { token } = useAuth();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [talla, setTalla] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [tallaError, setTallaError] = useState(false);
  const [toast, setToast] = useState(false);
  const [ratingInfo, setRatingInfo] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/productos/${id}/`)
      .then((res) => setProducto(res.data))
      .catch(() => setError('Producto no encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch average rating for the title area (lightweight, no auth needed)
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/productos/${id}/resenas`)
      .then((r) => setRatingInfo({ promedio: r.data.promedio, total: r.data.total }))
      .catch(() => {});
  }, [id]);

  // True when every talla is out of stock, or the product-level stock is 0
  const agotado = (() => {
    if (Array.isArray(producto?.tallas_stock) && producto.tallas_stock.length > 0) {
      return producto.tallas_stock.every((t) => t.stock === 0);
    }
    return typeof producto?.stock === 'number' && producto.stock === 0;
  })();

  // Stock for the selected talla
  const stockTalla = (() => {
    if (!talla || !producto) return null;
    const tallaObj = Array.isArray(producto.tallas_stock)
      ? producto.tallas_stock.find((t) => t.talla === talla)
      : null;
    return tallaObj?.stock ?? producto.stock ?? 99;
  })();

  // Reset cantidad to 1 when talla changes
  useEffect(() => { setCantidad(1); }, [talla]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clamp cantidad if stockTalla drops below current value
  useEffect(() => {
    if (stockTalla !== null && cantidad > stockTalla) setCantidad(stockTalla > 0 ? stockTalla : 1);
  }, [stockTalla]); // eslint-disable-line react-hooks/exhaustive-deps

  // Use tallas_stock (objects with stock info) if present, else fall back to talla string
  const tallas = (Array.isArray(producto?.tallas_stock) && producto.tallas_stock.length > 0)
    ? producto.tallas_stock
    : (producto?.talla ? producto.talla.split(',').map((s) => s.trim()).filter(Boolean) : []);

  const handleAgregar = () => {
    const hayTallas = tallas.length > 0;
    const disponibles = hayTallas
      ? tallas.filter((t) => typeof t === 'string' || (t.stock > 0))
      : [];
    if (disponibles.length > 0 && !talla) {
      setTallaError(true);
      return;
    }
    agregar(producto, talla ?? 'Única', cantidad);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const handleComprarAhora = () => {
    if (tallas.length > 0 && !talla) {
      setTallaError(true);
      document.querySelector('[data-talla-selector]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    handleAgregar();
    router.push('/carrito');
  };

  const imgSrc = producto?.imagen_url ?? producto?.imagen ?? null;
  const imagenes = (() => {
    const raw = producto?.imagenes;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((img) =>
        typeof img === 'string' ? img : (img.url ?? img.imagen_url ?? img.imagen ?? '')
      ).filter(Boolean);
    }
    return imgSrc ? [imgSrc] : [];
  })();

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <Toast show={toast} />

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase transition-colors mb-6"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Volver a productos
          </button>

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
            <div className="flex flex-col gap-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
              {/* Gallery */}
              <Gallery
                imagenes={imagenes}
                nombre={producto.nombre}
              />

              {/* Info */}
              <div className="flex flex-col gap-6">
                {/* Category + gender badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(producto.categoria?.nombre ?? producto.categoria) && (
                    <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase border border-white/15 px-2.5 py-1">
                      {producto.categoria?.nombre ?? producto.categoria}
                    </span>
                  )}
                  {producto.genero && (
                    <span className="text-blue-400/70 text-[10px] tracking-[0.3em] uppercase border border-blue-500/20 px-2.5 py-1">
                      {producto.genero}
                    </span>
                  )}
                  {producto.precio_oferta != null && Number(producto.precio_oferta) < Number(producto.precio) && (
                    <span className="bg-red-600 text-white text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1">
                      OFERTA
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

                {/* Rating summary */}
                {ratingInfo?.promedio && (
                  <div className="flex items-center gap-2">
                    <Stars value={Math.round(ratingInfo.promedio)} size={14} />
                    <span className="text-white/40 text-xs tracking-wide">
                      {ratingInfo.promedio.toFixed(1)} · {ratingInfo.total} {ratingInfo.total === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  </div>
                )}

                {/* Price */}
                {(() => {
                  const enOferta = producto.precio_oferta != null && Number(producto.precio_oferta) > 0 && Number(producto.precio_oferta) < Number(producto.precio);
                  const ahorro = enOferta ? Number(producto.precio) - Number(producto.precio_oferta) : 0;
                  return (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-baseline gap-3">
                        <span className="text-white text-3xl font-bold">
                          ${Number(enOferta ? producto.precio_oferta : producto.precio).toLocaleString('es-CO')}
                        </span>
                        {enOferta && (
                          <span className="text-white/30 text-lg line-through">
                            ${Number(producto.precio).toLocaleString('es-CO')}
                          </span>
                        )}
                        {!enOferta && producto.precio_original && producto.precio_original > producto.precio && (
                          <span className="text-white/30 text-lg line-through">
                            ${Number(producto.precio_original).toLocaleString('es-CO')}
                          </span>
                        )}
                      </div>
                      {enOferta && (
                        <span className="text-green-400 text-sm tracking-wide">
                          Ahorras ${ahorro.toLocaleString('es-CO')}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Description */}
                {producto.descripcion && (
                  <p className="text-white/50 text-sm leading-7 border-t border-white/10 pt-6">
                    {producto.descripcion}
                  </p>
                )}

                {/* Size selector */}
                {tallas.length > 0 && (
                  <div data-talla-selector>
                    <SizeSelector
                      tallas={tallas}
                      selected={talla}
                      onSelect={(t) => { setTalla(t); setTallaError(false); setCantidad(1); }}
                    />
                    {tallaError && (
                      <p className="text-red-400 text-xs mt-2 tracking-wide">
                        Debes seleccionar una talla para continuar
                      </p>
                    )}
                  </div>
                )}

                {/* Quantity + stock urgency */}
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-3">Cantidad</p>
                  <div className="flex items-center gap-4">
                    <QuantityControl
                      value={cantidad}
                      onChange={(val) => setCantidad(Math.min(Math.max(1, val), stockTalla ?? 99))}
                      max={stockTalla ?? 99}
                    />
                    {talla && stockTalla === 0 && (
                      <span style={{ color: '#f87171', fontSize: '10px', letterSpacing: '0.1em' }}>
                        Agotado en esta talla
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      opacity: (talla && stockTalla !== null && stockTalla > 0 && stockTalla <= 5) ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      marginTop: '8px',
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      style={{
                        color: stockTalla !== null && stockTalla <= 2 ? '#f87171' : '#fb923c',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                      }}
                    >
                      ⚡ Solo quedan {stockTalla} unidades
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {agotado ? (
                  <div className="pt-2">
                    <div className="w-full py-4 border border-white/10 text-white/25 text-xs font-bold tracking-[0.3em] uppercase text-center cursor-not-allowed">
                      Producto agotado
                    </div>
                  </div>
                ) : (
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
                )}

                {/* Trust signals */}
                <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                  {[
                    'Envíos a todo el Colombia',
                    'Devoluciones sin costo dentro de 30 días',
                    'Pago 100% seguro con Wompi',
                    'Los mejores precios para mayoristas',
                  ].map((text) => (
                    <p key={text} className="text-white/30 text-xs tracking-wide flex items-center gap-2">
                      <span className="text-white/20">✓</span> {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <Resenas productoId={id} />

            {/* Related products */}
            <RelatedProducts
              categoriaId={producto.categoria?.id ?? producto.categoria_id}
              categoriaNombre={producto.categoria?.nombre ?? (typeof producto.categoria === 'string' ? producto.categoria : null)}
              currentId={id}
            />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
