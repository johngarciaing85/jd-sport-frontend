'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const GENEROS = ['Todos', 'Dama', 'Caballero'];
const CATEGORIAS = ['Todas', 'Camisas', 'Pantalones', 'Vestidos', 'Zapatos', 'Accesorios', 'Deportivo'];

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

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genero, setGenero] = useState('Todos');
  const [categoria, setCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  const fetchProductos = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = {};
    if (genero !== 'Todos') params.genero = genero.toLowerCase();
    if (categoria !== 'Todas') params.categoria = categoria.toLowerCase();
    if (busqueda.trim()) params.q = busqueda.trim();

    axios
      .get('http://localhost:8000/api/productos/', { params })
      .then((res) => setProductos(res.data))
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, [genero, categoria, busqueda]);

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
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-[#111] border border-white/15 text-white text-sm pl-10 pr-4 py-3 placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors tracking-wide"
              />
            </div>

            {/* Gender filter */}
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-3">Género</p>
              <div className="flex flex-wrap gap-2">
                {GENEROS.map((g) => (
                  <FilterChip key={g} label={g} active={genero === g} onClick={() => setGenero(g)} />
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-3">Categoría</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((c) => (
                  <FilterChip key={c} label={c} active={categoria === c} onClick={() => setCategoria(c)} />
                ))}
              </div>
            </div>
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
                onClick={() => { setGenero('Todos'); setCategoria('Todas'); setBusqueda(''); }}
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
