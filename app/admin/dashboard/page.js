'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat('es-CO');

function formatCOP(v) { return COP.format(Number(v) || 0); }
function formatNum(v)  { return NUM.format(Number(v) || 0); }

function isAdmin(usuario) {
  return (
    usuario?.rol === 'admin' ||
    usuario?.role === 'admin' ||
    usuario?.is_admin === true ||
    usuario?.is_staff === true ||
    usuario?.es_admin === true
  );
}

/* ─── Metric card ────────────────────────────────────────────────────────── */
function MetricCard({ label, value, sub, accent = false, icon }) {
  return (
    <div
      className={`flex flex-col justify-between p-5 border transition-colors ${
        accent
          ? 'bg-white text-black border-white'
          : 'bg-[#0d0d0d] border-white/10 hover:border-white/20 text-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        <p
          className={`text-[10px] tracking-[0.3em] uppercase font-medium ${
            accent ? 'text-black/50' : 'text-white/35'
          }`}
        >
          {label}
        </p>
        {icon && (
          <span className={accent ? 'text-black/30' : 'text-white/20'}>{icon}</span>
        )}
      </div>
      <div>
        <p
          className={`font-black leading-none ${
            accent ? 'text-black text-2xl' : 'text-white text-2xl'
          }`}
          style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
        >
          {value}
        </p>
        {sub && (
          <p className={`text-xs mt-1.5 ${accent ? 'text-black/45' : 'text-white/35'}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Section title ──────────────────────────────────────────────────────── */
function SectionTitle({ children }) {
  return (
    <h2 className="text-white/35 text-[10px] tracking-[0.35em] uppercase mb-4 font-medium">
      {children}
    </h2>
  );
}

/* ─── Orders by status ───────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  pagado:     { label: 'Pagado',     color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  procesando: { label: 'Procesando', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  enviado:    { label: 'Enviado',    color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  entregado:  { label: 'Entregado',  color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  cancelado:  { label: 'Cancelado',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

function OrdersByStatus({ data = {} }) {
  const entries = Object.entries(data);
  if (!entries.length) return <p className="text-white/25 text-xs">Sin datos.</p>;

  const max = Math.max(...entries.map(([, v]) => Number(v) || 0), 1);

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([key, count]) => {
        const cfg = STATUS_CONFIG[key] ?? { label: key, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
        const pct = ((Number(count) / max) * 100).toFixed(1);
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[10px] tracking-[0.15em] uppercase" style={{ color: cfg.color }}>
              {cfg.label}
            </span>
            <div className="flex-1 h-5 bg-white/5 overflow-hidden">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${pct}%`, background: cfg.bg, borderRight: `2px solid ${cfg.color}` }}
              />
            </div>
            <span className="w-8 text-right text-white font-bold text-sm shrink-0">{formatNum(count)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Low stock table ────────────────────────────────────────────────────── */
function LowStockTable({ productos = [] }) {
  if (!productos.length) {
    return (
      <div className="flex items-center gap-2 py-6">
        <span className="text-green-400 text-sm">✓</span>
        <p className="text-white/30 text-xs tracking-wide">Todos los productos tienen stock suficiente.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            {['Producto', 'Categoría', 'Talla', 'Stock', 'Estado'].map((h) => (
              <th key={h} className="pb-3 text-[10px] tracking-[0.25em] uppercase text-white/30 font-medium pr-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => {
            const stock = Number(p.stock ?? p.cantidad ?? 0);
            const critico = stock <= 2;
            return (
              <tr key={p.id ?? i} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4">
                  <Link
                    href={`/productos/${p.id}`}
                    className="text-white text-sm hover:text-white/70 transition-colors tracking-wide"
                  >
                    {p.nombre}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-white/40 text-xs">
                  {p.categoria?.nombre ?? p.categoria ?? '—'}
                </td>
                <td className="py-3 pr-4 text-white/40 text-xs">
                  {p.talla ?? '—'}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className="font-bold text-sm"
                    style={{ color: critico ? '#f87171' : '#facc15' }}
                  >
                    {stock}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className="text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5"
                    style={
                      critico
                        ? { color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }
                        : { color: '#facc15', borderColor: 'rgba(250,204,21,0.3)', background: 'rgba(250,204,21,0.08)' }
                    }
                  >
                    {critico ? 'Crítico' : 'Bajo'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-white/5 border border-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/5 border border-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-60 bg-white/5 border border-white/5" />
        <div className="h-60 bg-white/5 border border-white/5" />
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();
  const { usuario, token } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios
      .get('http://localhost:8000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.replace('/login');
        } else {
          setError('No se pudo cargar el dashboard. Verifica la conexión con el servidor.');
        }
      })
      .finally(() => setLoading(false));
  }, [token, router]);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    console.log('[Dashboard] usuario:', usuario);
    console.log('[Dashboard] isAdmin:', isAdmin(usuario));
    if (!isAdmin(usuario)) { router.replace('/'); return; }
    fetchData();
  }, [token, usuario, router, fetchData]);

  const ingresos  = data?.ingresos  ?? {};
  const ventas    = data?.ventas    ?? {};
  const clientes  = data?.clientes  ?? {};
  const estadosPedidos    = data?.pedidos_por_estado ?? {};
  const bajoStock         = data?.productos_bajo_stock ?? [];
  const solicitudes       = Number(data?.solicitudes_pendientes ?? 0);
  const pedidosActivos    = Number(data?.pedidos_activos ?? 0);

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-8 border-b border-white/10">
            <div>
              <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase mb-2">Panel de administración</p>
              <h1
                className="text-white font-black text-4xl uppercase tracking-tight"
                style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
              >
                Dashboard
              </h1>
              <p className="text-white/30 text-xs mt-2 capitalize">{today}</p>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <p className="text-white/20 text-[10px] tracking-wide hidden sm:block">
                  Actualizado {lastUpdated.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 text-white/50 hover:text-white text-xs tracking-[0.2em] uppercase border border-white/15 hover:border-white/40 px-4 py-2 transition-colors disabled:opacity-40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="border border-red-500/20 bg-red-500/5 px-5 py-4 mb-8 flex items-center justify-between">
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={fetchData} className="text-red-400/70 hover:text-red-400 text-xs tracking-widest uppercase transition-colors">
                Reintentar
              </button>
            </div>
          )}

          {loading && !data ? (
            <DashboardSkeleton />
          ) : data ? (
            <div className="flex flex-col gap-10">

              {/* ── Ingresos ── */}
              <div>
                <SectionTitle>Ingresos</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MetricCard
                    label="Hoy"
                    value={formatCOP(ingresos.hoy)}
                    sub={`${formatNum(ventas.hoy ?? 0)} orden${(ventas.hoy ?? 0) !== 1 ? 'es' : ''}`}
                    accent
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Esta semana"
                    value={formatCOP(ingresos.semana)}
                    sub={`${formatNum(ventas.semana ?? 0)} órdenes`}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Este mes"
                    value={formatCOP(ingresos.mes)}
                    sub={`${formatNum(ventas.mes ?? 0)} órdenes`}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    }
                  />
                </div>
              </div>

              {/* ── Quick stats row ── */}
              <div>
                <SectionTitle>Resumen general</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    label="Total clientes"
                    value={formatNum(clientes.total)}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Nuevos este mes"
                    value={formatNum(clientes.nuevos_mes ?? clientes.nuevos)}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Pedidos activos"
                    value={formatNum(pedidosActivos || Object.values(estadosPedidos).reduce((a, v) => a + Number(v), 0))}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Solicitudes pendientes"
                    value={formatNum(solicitudes)}
                    sub={solicitudes > 0 ? 'Requieren atención' : 'Al día'}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    }
                  />
                </div>
              </div>

              {/* ── Orders by status + Low stock ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Orders by status */}
                <div className="bg-[#0d0d0d] border border-white/10 p-6">
                  <SectionTitle>Pedidos por estado</SectionTitle>
                  <OrdersByStatus data={estadosPedidos} />
                </div>

                {/* Low stock */}
                <div className="bg-[#0d0d0d] border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <SectionTitle>Productos con bajo stock</SectionTitle>
                    {bajoStock.length > 0 && (
                      <span
                        className="text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5 mb-4"
                        style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}
                      >
                        {bajoStock.length} alertas
                      </span>
                    )}
                  </div>
                  <LowStockTable productos={bajoStock} />
                </div>
              </div>

              {/* ── Solicitudes pendientes detail (if any) ── */}
              {solicitudes > 0 && (
                <div className="border border-yellow-500/20 bg-yellow-500/5 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <svg className="text-yellow-400 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <p className="text-yellow-400 text-sm">
                      Tienes <span className="font-bold">{solicitudes}</span> solicitud{solicitudes !== 1 ? 'es' : ''} pendiente{solicitudes !== 1 ? 's' : ''} que requiere{solicitudes === 1 ? '' : 'n'} atención.
                    </p>
                  </div>
                  <Link
                    href="/admin/solicitudes"
                    className="text-yellow-400/70 hover:text-yellow-400 text-xs tracking-[0.2em] uppercase border border-yellow-500/30 hover:border-yellow-500/60 px-4 py-2 transition-colors shrink-0"
                  >
                    Ver solicitudes →
                  </Link>
                </div>
              )}

            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
