'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const ESTADO_CFG = {
  pendiente:  { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.1)',   border: 'rgba(250,204,21,0.25)'  },
  separado:   { label: 'Separado',   color: '#c084fc', bg: 'rgba(192,132,252,0.1)',  border: 'rgba(192,132,252,0.25)' },
  pagado:     { label: 'Pagado',     color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.25)'  },
  procesando: { label: 'Procesando', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.25)' },
  enviado:    { label: 'Enviado',    color: '#fb923c', bg: 'rgba(251,146,60,0.1)',   border: 'rgba(251,146,60,0.25)'  },
  entregado:  { label: 'Entregado',  color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.25)'  },
  cancelado:  { label: 'Cancelado',  color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)' },
};

function estadoCfg(e) {
  return ESTADO_CFG[e?.toLowerCase()] ?? { label: e ?? '—', color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)' };
}

function fmtFecha(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return v;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
}

/* ─── Countdown for separado orders ──────────────────────────────────────── */
function Countdown({ expiraEn }) {
  const [text, setText] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiraEn) - Date.now();
      if (diff <= 0) { setText('Expirado'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setText(h > 0 ? `Expira en ${h}h ${m}min` : `Expira en ${m} min`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [expiraEn]);

  if (!text) return null;
  const expired = text === 'Expirado';
  return (
    <span className="text-[10px] tracking-wide font-medium" style={{ color: expired ? '#f87171' : '#fb923c' }}>
      {expired ? '⚠ Reserva expirada' : `⏱ ${text}`}
    </span>
  );
}

/* ─── Estado badge ────────────────────────────────────────────────────────── */
function EstadoBadge({ estado }) {
  const cfg = estadoCfg(estado);
  return (
    <span className="text-[10px] tracking-[0.15em] uppercase border px-2.5 py-1 whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
}

/* ─── Order card ──────────────────────────────────────────────────────────── */
function PedidoCard({ pedido }) {
  const [open, setOpen] = useState(false);
  const estado = (pedido.estado ?? '').toLowerCase();
  const items  = Array.isArray(pedido.items) ? pedido.items : [];
  const expira = pedido.expira_en ?? pedido.expira ?? null;

  return (
    <div className="bg-[#0d0d0d] border border-white/10 hover:border-white/20 transition-colors">
      {/* ── Header row ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start sm:items-center justify-between gap-4 px-5 py-4 text-left group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 flex-1 min-w-0">
          <span className="text-white/40 text-xs font-mono shrink-0">
            #{pedido.numero_pedido ?? pedido.id}
          </span>
          <span className="text-white/40 text-xs shrink-0">
            {fmtFecha(pedido.creado_en ?? pedido.fecha_creacion ?? pedido.fecha)}
          </span>
          <span className="text-white font-bold text-sm shrink-0">
            {pedido.total ? COP.format(Number(pedido.total)) : '—'}
          </span>
          <EstadoBadge estado={pedido.estado} />
          {estado === 'separado' && expira && <Countdown expiraEn={expira} />}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-white/25 group-hover:text-white/50 transition-transform shrink-0 mt-0.5 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Expanded: items ── */}
      {open && (
        <div className="border-t border-white/[0.07] px-5 py-4">
          {items.length === 0 ? (
            <p className="text-white/25 text-xs tracking-wide py-2">Sin detalle de productos disponible.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item, i) => {
                const imgSrc = item.producto?.imagen_url ?? item.producto?.imagen ?? item.imagen_url ?? item.imagen ?? null;
                const nombre = item.producto?.nombre ?? item.nombre ?? `Producto #${item.producto_id}`;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="shrink-0 w-12 h-14 bg-[#111] border border-white/10 overflow-hidden">
                      {imgSrc ? (
                        <img src={imgSrc} alt={nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/10 text-xs font-black">JD</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm tracking-wide leading-snug truncate">{nombre}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {item.talla && (
                          <span className="text-white/30 text-[10px] tracking-widest uppercase">Talla: {item.talla}</span>
                        )}
                        <span className="text-white/30 text-[10px]">× {item.cantidad}</span>
                      </div>
                    </div>
                    {item.precio_unitario && (
                      <span className="text-white/50 text-xs font-medium shrink-0">
                        {COP.format(Number(item.precio_unitario))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {pedido.notas && (
            <p className="text-white/25 text-[10px] tracking-wide mt-4 border-t border-white/[0.06] pt-3 leading-relaxed">
              {pedido.notas}
            </p>
          )}

          {estado === 'separado' && (
            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <p className="text-white/40 text-xs tracking-wide leading-relaxed">
                Tu pedido está reservado. Acércate a nuestra tienda física para completar el pago.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#0d0d0d] border border-white/10 h-16" />
      ))}
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg className="text-white/10 mb-6" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <p className="text-white/30 text-sm tracking-wide mb-2">Aún no tienes pedidos</p>
      <p className="text-white/20 text-xs mb-8">Cuando realices una compra, aparecerá aquí.</p>
      <Link
        href="/productos"
        className="text-xs tracking-[0.3em] uppercase bg-white text-black font-bold px-8 py-3 hover:bg-white/90 transition-colors"
      >
        Ver productos
      </Link>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function MisPedidosPage() {
  const router = useRouter();
  const { usuario, token } = useAuth();

  const [mounted,  setMounted]  = useState(false);
  const [pedidos,  setPedidos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => setMounted(true), []);

  const fetchPedidos = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios
      .get('http://localhost:8000/api/pedidos/', {
        params:  { pagina: 1, tamano: 50 },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setPedidos(list);
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.replace('/login');
        } else {
          setError('No se pudieron cargar tus pedidos. Intenta de nuevo.');
        }
      })
      .finally(() => setLoading(false));
  }, [token, router]);

  useEffect(() => {
    if (!mounted) return;
    if (!token || !usuario) { router.replace('/login'); return; }
    fetchPedidos();
  }, [mounted, token, usuario, router, fetchPedidos]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="mb-10 pb-8 border-b border-white/10">
            <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase mb-2">Mi cuenta</p>
            <h1
              className="text-white font-black text-4xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Mis Pedidos
            </h1>
            {!loading && pedidos.length > 0 && (
              <p className="text-white/30 text-xs mt-2">
                {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="border px-5 py-4 mb-8 flex items-center justify-between"
              style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}>
              <span className="text-sm">{error}</span>
              <button onClick={fetchPedidos}
                className="text-xs tracking-[0.2em] uppercase text-red-400/60 hover:text-red-400 transition-colors">
                Reintentar
              </button>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <Skeleton />
          ) : pedidos.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-3">
              {pedidos.map((p) => (
                <PedidoCard key={p.id} pedido={p} />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
