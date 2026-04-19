'use client';
import { API_URL } from '@/lib/api';
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
function PedidoCard({ pedido, token, onPagoConfirmado }) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const estado = (pedido.estado ?? '').toLowerCase();
  const items  = Array.isArray(pedido.items) ? pedido.items : [];
  const expira = pedido.expira_en ?? pedido.expira ?? null;

  const handleConfirmarPago = async () => {
    setConfirmando(true);
    setConfirmError(null);
    try {
      await axios.post(
        `${API_URL}/pedidos/admin/${pedido.id}/confirmar-pago-tienda`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowConfirm(false);
      if (onPagoConfirmado) onPagoConfirmado(pedido.id);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setConfirmError(
        Array.isArray(detail) ? detail.map(e => e.msg).join(', ')
        : (typeof detail === 'string' ? detail : 'Error al confirmar el pago. Intenta de nuevo.')
      );
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <>
    {/* ── Confirmation modal ── */}
    {showConfirm && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.88)' }}
        onClick={(e) => { if (e.target === e.currentTarget && !confirmando) setShowConfirm(false); }}
      >
        <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Confirmar pago</p>
              <p className="text-white text-sm font-bold tracking-wide mt-0.5">
                ¿Estás seguro?
              </p>
            </div>
            <button onClick={() => setShowConfirm(false)} disabled={confirmando} className="text-white/30 hover:text-white transition-colors p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Pedido</p>
              <p className="text-white text-sm font-medium">#{pedido.numero_pedido ?? pedido.id}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Total</p>
              <p className="text-white text-sm font-bold">{pedido.total ? COP.format(Number(pedido.total)) : '—'}</p>
            </div>
            <div className="mt-2 border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-amber-400/80 text-xs tracking-wide leading-relaxed">
                Al confirmar el pago, tu pedido pasará a estado <strong>pagado</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            {confirmError && (
              <div className="px-4 py-3 text-xs border"
                style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
                {confirmError}
              </div>
            )}
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={() => setShowConfirm(false)} disabled={confirmando}
              className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors disabled:opacity-40">
              Cancelar
            </button>
            <button onClick={handleConfirmarPago} disabled={confirmando}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {confirmando && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              )}
              {confirmando ? 'Procesando...' : 'Sí, confirmar pago'}
            </button>
          </div>
        </div>
      </div>
    )}

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
            <div className="mt-4 border-t border-white/[0.06] pt-3 flex flex-col gap-3">
              <p className="text-white/40 text-xs tracking-wide leading-relaxed">
                Tu pedido está reservado. Acércate a nuestra tienda física para completar el pago.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.41a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.97-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>317 749 9434</span>
                </div>
                <a
                  href={`https://wa.me/573177499434?text=${encodeURIComponent(`Hola JD Sport, quiero confirmar mi pedido #${pedido.numero_pedido ?? pedido.id} que está separado. ¿Cómo puedo completar el pago?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase border px-3 py-1.5 transition-colors hover:bg-green-500/10"
                  style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase border px-3 py-1.5 transition-colors hover:bg-purple-500/10"
                  style={{ color: '#c084fc', borderColor: 'rgba(192,132,252,0.3)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Confirmar pago
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
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
      .get(`${API_URL}/pedidos/`, {
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
                <PedidoCard
                  key={p.id}
                  pedido={p}
                  token={token}
                  onPagoConfirmado={(id) => {
                    setPedidos((prev) => prev.map((ped) => ped.id === id ? { ...ped, estado: 'pagado' } : ped));
                  }}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}