'use client';
import { API_URL } from '@/lib/api';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const GENEROS = [
  { label: 'Todos',     value: ''       },
  { label: 'Caballero', value: 'hombre' },
  { label: 'Dama',      value: 'mujer'  },
];

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs tracking-[0.2em] uppercase px-4 py-2 border transition-all ${
        active
          ? 'bg-white text-black border-white'
          : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-[#111] border border-white/10 animate-pulse">
      <div className="aspect-[3/4] bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/4 mt-4" />
      </div>
    </div>
  );
}

function ProductosContent() {
  const searchParams = useSearchParams();
  const [productos,  setProductos]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [genero,     setGenero]     = useState('');
  const [categoriaId,setCategoriaId]= useState('');
  const [busqueda,   setBusqueda]   = useState('');
  const [categorias, setCategorias] = useState([]);
  const searchRef = useRef(null);

  // Read ?q= and ?genero= from URL on mount AND on navigation changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setBusqueda(q);
    const g = searchParams.get('genero');
    if (g) {
      const normalized = g.toLowerCase();
      if (normalized === 'mujer' || normalized === 'dama') setGenero('mujer');
      else if (normalized === 'hombre' || normalized === 'caballero') setGenero('hombre');
    } else {
      setGenero('');
    }
  }, [searchParams]);

  // Fetch categories once on mount
  useEffect(() => {
    axios.get(`${API_URL}/categorias/`)
      .then((res) => {
        const list = res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setCategorias(list);
      })
      .catch(() => {});
  }, []);

  const fetchProductos = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (genero)       params.genero      = genero;
    if (categoriaId)  params.categoria_id = categoriaId;
    if (busqueda.trim()) params.q         = busqueda.trim();

    axios
      .get(`${API_URL}/productos/`, { params })
      .then((res) => {
        const list = res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setProductos(list);
      })
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, [genero, categoriaId, busqueda]);

  useEffect(() => {
    const t = setTimeout(fetchProductos, 300);
    return () => clearTimeout(t);
  }, [fetchProductos]);

  const activeCount = !loading && !error ? productos.length : null;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Page header */}
        <div className="border-b border-white/10 bg-[#080808] px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-3">Catálogo</p>
            <h1
              className="text-white font-black text-4xl md:text-5xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Productos
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Filters */}
          <div className="flex flex-col gap-6 mb-10">
            {/* Search */}
            <div className="relative max-w-sm">
              {/* Search icon or spinner */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                {loading && busqueda ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
              </div>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-[#111] border border-white/15 text-white text-sm pl-10 pr-9 py-3 placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors tracking-wide"
              />
              {/* Clear button */}
              {busqueda && (
                <button
                  onClick={() => { setBusqueda(''); searchRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/70 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Gender filter */}
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-3">Género</p>
              <div className="flex flex-wrap gap-2">
                {GENEROS.map(({ label, value }) => (
                  <FilterChip key={value} label={label} active={genero === value} onClick={() => setGenero(value)} />
                ))}
              </div>
            </div>

            {/* Category filter */}
            {categorias.length > 0 && (
              <div>
                <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-3">Categoría</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip label="Todas" active={categoriaId === ''} onClick={() => setCategoriaId('')} />
                  {categorias.map((c) => (
                    <FilterChip
                      key={c.id}
                      label={c.nombre}
                      active={categoriaId === String(c.id)}
                      onClick={() => setCategoriaId(String(c.id))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results count */}
          {activeCount !== null && (
            <p className="text-white/30 text-xs tracking-[0.2em] uppercase mb-6">
              {activeCount} {activeCount === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>
          )}

          {/* Grid */}
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}

          {error && (
            <div className="border border-white/10 p-12 text-center">
              <p className="text-white/40 text-sm mb-4">{error}</p>
              <button
                onClick={fetchProductos}
                className="text-xs tracking-[0.2em] uppercase border border-white/20 px-6 py-2 text-white/60 hover:text-white hover:border-white/50 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && productos.length === 0 && (
            <div className="border border-white/10 p-12 text-center">
              <p className="text-white/40 text-sm">No se encontraron productos con los filtros seleccionados.</p>
              <button
                onClick={() => { setGenero(''); setCategoriaId(''); setBusqueda(''); }}
                className="mt-4 text-xs tracking-[0.2em] uppercase border border-white/20 px-6 py-2 text-white/60 hover:text-white hover:border-white/50 transition-colors"
              >
                Limpiar filtros
              </button>
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
      </main>

      <Footer />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <p className="text-white/30 text-sm">Cargando productos...</p>
          </div>
        </main>
      </div>
    }>
      <ProductosContent />
    </Suspense>
  );
}