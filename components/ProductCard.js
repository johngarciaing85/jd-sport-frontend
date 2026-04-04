import Link from 'next/link';

export default function ProductCard({ producto }) {
  const { id, nombre, precio, categoria, genero } = producto;
  const imgSrc = producto.imagen_url ?? producto.imagen ?? null;
  const categoriaNombre = categoria?.nombre ?? categoria ?? null;
  const tallas = producto.tallas ?? (producto.talla ? producto.talla.split(',').map((s) => s.trim()).filter(Boolean) : []);

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

        {tallas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tallas.slice(0, 6).map((t) => (
              <span key={t} className="text-[9px] tracking-wide text-white/40 border border-white/10 px-1.5 py-0.5">
                {t}
              </span>
            ))}
            {tallas.length > 6 && (
              <span className="text-[9px] tracking-wide text-white/25 px-1 py-0.5">+{tallas.length - 6}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-white font-bold text-base">
            ${typeof precio === 'number' ? precio.toFixed(2) : precio}
          </span>
          <Link
            href={`/productos/${id}`}
            className="text-[10px] tracking-[0.2em] uppercase text-white/60 border border-white/20 px-3 py-1.5 hover:bg-white hover:text-black transition-all duration-200"
          >
            Ver más
          </Link>
        </div>
      </div>
    </div>
  );
}
