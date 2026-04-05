import Link from 'next/link';

function StockBadge({ stock }) {
  if (stock === 0)    return <span className="text-[9px] tracking-[0.15em] uppercase border px-2 py-0.5 whitespace-nowrap" style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}>Agotado</span>;
  if (stock <= 3)     return <span className="text-[9px] tracking-[0.15em] uppercase border px-2 py-0.5 whitespace-nowrap" style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}>¡Solo {stock} {stock === 1 ? 'unidad' : 'unidades'}!</span>;
  if (stock <= 10)    return <span className="text-[9px] tracking-[0.15em] uppercase border px-2 py-0.5 whitespace-nowrap" style={{ color: '#fb923c', borderColor: 'rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.08)' }}>Pocas unidades</span>;
  return null;
}

export default function ProductCard({ producto }) {
  const { id, nombre, precio, categoria, genero } = producto;

  // Use tallas_stock (with availability) if present, else fall back to talla string
  const tallasStock = Array.isArray(producto.tallas_stock) && producto.tallas_stock.length > 0
    ? producto.tallas_stock
    : null;
  const tallasSimple = producto.tallas ?? (producto.talla ? producto.talla.split(',').map((s) => s.trim()).filter(Boolean) : []);

  // Compute overall agotado: from tallas_stock if available, else from stock field
  const agotado = tallasStock
    ? tallasStock.every((t) => t.stock === 0)
    : typeof producto.stock === 'number' && producto.stock === 0;

  const stock = tallasStock ? null : (typeof producto.stock === 'number' ? producto.stock : null);
  const imgSrc = producto.imagen_url ?? producto.imagen ?? null;
  const categoriaNombre = categoria?.nombre ?? categoria ?? null;

  return (
    <div className="group flex flex-col bg-[#111] border border-white/10 hover:border-white/25 transition-all duration-300">
      {/* Image */}
      <div className="aspect-[3/4] bg-[#1a1a1a] overflow-hidden relative">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-white/10 text-7xl font-black select-none"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              JD
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {categoriaNombre && (
            <span className="bg-black/80 backdrop-blur-sm text-white/80 text-[10px] tracking-[0.2em] uppercase px-2.5 py-1">
              {categoriaNombre}
            </span>
          )}
          {genero && (
            <span className="bg-blue-900/70 backdrop-blur-sm text-blue-200 text-[10px] tracking-[0.2em] uppercase px-2.5 py-1">
              {genero}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-white font-medium text-sm tracking-wide leading-snug">
            {nombre}
          </h3>
        </div>

        {tallasStock ? (
          <div className="flex flex-wrap gap-1">
            {tallasStock.slice(0, 6).map(({ talla, stock: s }) => (
              <span
                key={talla}
                className="text-[9px] tracking-wide border px-1.5 py-0.5"
                style={s === 0
                  ? { color: 'rgba(248,113,113,0.4)', borderColor: 'rgba(248,113,113,0.15)', textDecoration: 'line-through' }
                  : { color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.1)' }
                }
              >
                {talla}
              </span>
            ))}
            {tallasStock.length > 6 && (
              <span className="text-[9px] tracking-wide text-white/25 px-1 py-0.5">+{tallasStock.length - 6}</span>
            )}
          </div>
        ) : tallasSimple.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tallasSimple.slice(0, 6).map((t) => (
              <span key={t} className="text-[9px] tracking-wide text-white/40 border border-white/10 px-1.5 py-0.5">
                {t}
              </span>
            ))}
            {tallasSimple.length > 6 && (
              <span className="text-[9px] tracking-wide text-white/25 px-1 py-0.5">+{tallasSimple.length - 6}</span>
            )}
          </div>
        ) : null}

        {stock !== null && <StockBadge stock={stock} />}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-white font-bold text-base">
            ${typeof precio === 'number' ? precio.toFixed(2) : precio}
          </span>
          <Link
            href={`/productos/${id}`}
            className={`text-[10px] tracking-[0.2em] uppercase border px-3 py-1.5 transition-all duration-200 ${
              agotado
                ? 'text-white/20 border-white/10 pointer-events-none opacity-50'
                : 'text-white/60 border-white/20 hover:bg-white hover:text-black'
            }`}
          >
            {agotado ? 'Agotado' : 'Ver más'}
          </Link>
        </div>
      </div>
    </div>
  );
}
