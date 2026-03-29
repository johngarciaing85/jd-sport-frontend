'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';

/* ─── Status badge ───────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  pendiente:   { label: 'Pendiente',   cls: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' },
  procesando:  { label: 'Procesando',  cls: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  enviado:     { label: 'Enviado',     cls: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  entregado:   { label: 'Entregado',   cls: 'text-green-400 border-green-400/30 bg-green-400/5' },
  cancelado:   { label: 'Cancelado',   cls: 'text-red-400 border-red-400/30 bg-red-400/5' },
};

function StatusBadge({ estado }) {
  const s = STATUS_STYLES[estado?.toLowerCase()] ?? {
    label: estado ?? 'Desconocido',
    cls: 'text-white/40 border-white/15 bg-white/5',
  };
  return (
    <span className={`text-[10px] tracking-[0.2em] uppercase border px-2.5 py-1 ${s.cls}`}>
      {s.label}
    </span>
  );
}

/* ─── Order detail panel ─────────────────────────────────────────────────── */
function OrderDetail({ pedido }) {
  const items = pedido.items ?? pedido.productos ?? [];

  return (
    <div className="border-t border-white/10 bg-[#080808] px-5 py-5 mt-0">
      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-1">Productos</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.imagen && (
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-10 h-12 object-cover bg-[#111] shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs tracking-wide truncate">{item.nombre}</p>
                {item.talla && (
                  <p className="text-white/30 text-[10px] tracking-wide">Talla: {item.talla}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-white/60 text-xs">×{item.cantidad}</p>
                <p className="text-white text-xs font-medium">
                  ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/25 text-xs">Sin detalle de productos disponible.</p>
      )}

      {pedido.direccion_envio && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-1">Dirección de envío</p>
          <p className="text-white/50 text-xs leading-relaxed">{pedido.direccion_envio}</p>
        </div>
      )}

      {pedido.metodo_pago && (
        <div className="mt-3">
          <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-1">Método de pago</p>
          <p className="text-white/50 text-xs">{pedido.metodo_pago}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Order row ──────────────────────────────────────────────────────────── */
function OrderRow({ pedido }) {
  const [expanded, setExpanded] = useState(false);

  const fecha = pedido.fecha_creacion ?? pedido.created_at ?? pedido.fecha;
  const formattedDate = fecha
    ? new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  const numItems =
    (pedido.items ?? pedido.productos ?? []).length;

  return (
    <div className="border border-white/10 overflow-hidden">
      <button
        className="w-full text-left px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Order number + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-white font-bold text-sm tracking-wide">
              #{pedido.numero ?? pedido.id}
            </span>
            <StatusBadge estado={pedido.estado} />
          </div>
          <p className="text-white/30 text-xs">{formattedDate}</p>
        </div>

        {/* Items count */}
        <div className="hidden sm:block text-right shrink-0">
          <p className="text-white/40 text-xs tracking-wide">
            {numItems} {numItems === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>

        {/* Total */}
        <div className="text-right shrink-0">
          <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-0.5">Total</p>
          <p className="text-white font-bold text-base">
            ${Number(pedido.total).toLocaleString('es-CO')}
          </p>
        </div>

        {/* Chevron */}
        <div className={`shrink-0 text-white/30 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && <OrderDetail pedido={pedido} />}
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-white/10 px-5 py-5 flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/5 rounded w-1/3" />
            <div className="h-3 bg-white/5 rounded w-1/4" />
          </div>
          <div className="h-5 bg-white/5 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function MisPedidosPage() {
  const router = useRouter();
  const { usuario, token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated (after hydration)
    if (!token) {
      router.replace('/login');
      return;
    }

    axios
      .get('http://localhost:8000/api/pedidos/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
        setPedidos(data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          router.replace('/login');
        } else {
          setError('No se pudieron cargar tus pedidos.');
        }
      })
      .finally(() => setLoading(false));
  }, [token, router]);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-10">
            <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-3">Mi cuenta</p>
            <h1
              className="text-white font-black text-4xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Mis pedidos
            </h1>
            {usuario?.nombre && (
              <p className="text-white/40 text-sm mt-2">
                Hola, <span className="text-white/70">{usuario.nombre}</span>
              </p>
            )}
          </div>

          {/* Content */}
          {loading && <Skeleton />}

          {error && (
            <div className="border border-white/10 p-12 text-center">
              <p className="text-white/40 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs tracking-[0.2em] uppercase border border-white/20 px-6 py-2 text-white/60 hover:text-white transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && pedidos.length === 0 && (
            <div className="border border-white/10 p-12 text-center">
              <svg
                className="text-white/10 mx-auto mb-6"
                width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p className="text-white/30 text-sm tracking-wide mb-8">
                Aún no tienes pedidos realizados.
              </p>
              <Link
                href="/productos"
                className="text-xs tracking-[0.3em] uppercase bg-white text-black font-bold px-8 py-3 hover:bg-white/90 transition-colors"
              >
                Explorar productos
              </Link>
            </div>
          )}

          {!loading && !error && pedidos.length > 0 && (
            <>
              <p className="text-white/30 text-xs tracking-[0.2em] uppercase mb-5">
                {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
              </p>
              <div className="flex flex-col gap-3">
                {pedidos.map((p) => (
                  <OrderRow key={p.id ?? p.numero} pedido={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
