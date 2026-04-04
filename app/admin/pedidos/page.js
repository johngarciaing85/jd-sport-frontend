'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth';

function isAdmin(u) {
  return (
    u?.rol === 'admin' || u?.role === 'admin' ||
    u?.is_admin === true || u?.is_staff === true || u?.es_admin === true
  );
}

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/* ─── Config ─────────────────────────────────────────────────────────────── */
const ESTADO_CFG = {
  pendiente:  { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.3)'  },
  separado:   { label: 'Separado',   color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)' },
  pagado:     { label: 'Pagado',     color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)'  },
  procesando: { label: 'Procesando', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  enviado:    { label: 'Enviado',    color: '#e879f9', bg: 'rgba(232,121,249,0.12)', border: 'rgba(232,121,249,0.3)' },
  entregado:  { label: 'Entregado',  color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)'  },
  cancelado:  { label: 'Cancelado',  color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
};

const FILTERS = [
  { key: 'todos',     label: 'Todos'      },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'separado',  label: 'Separados'  },
  { key: 'pagado',    label: 'Pagados'    },
  { key: 'enviado',   label: 'Enviados'   },
  { key: 'entregado', label: 'Entregados' },
];

function estadoCfg(e) {
  return ESTADO_CFG[e?.toLowerCase()] ?? { label: e ?? '—', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' };
}

function fmtFecha(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return v;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* Parse guest contact info from notas field.
   Expected format (flexible): "[Entrega a domicilio] Nombre: X | Email: Y | Celular: Z | Dirección: W"
   Returns { nombre, email, celular, direccion } or null if not a guest order. */
function parseGuestNotas(notas) {
  if (!notas || !notas.startsWith('[Entrega a domicilio]')) return null;
  const get = (label) => {
    const m = notas.match(new RegExp(label + ':\\s*([^|\\n]+)', 'i'));
    return m ? m[1].trim() : '';
  };
  return {
    nombre:    get('Nombre'),
    email:     get('Email'),
    celular:   get('Celular'),
    direccion: get('Dirección') || get('Direccion'),
  };
}

function fmtExpira(v) {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d)) return null;
  const diff = d - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (diff < 0)  return { text: 'Expirado', color: '#f87171' };
  if (days <= 1) return { text: days === 0 ? 'Hoy' : 'Mañana', color: '#fb923c' };
  return { text: `${days}d`, color: '#facc15' };
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function EstadoBadge({ estado }) {
  const cfg = estadoCfg(estado);
  return (
    <span className="text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5 whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
}

function FilterChips({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FILTERS.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)}
          className={`text-[10px] tracking-[0.2em] uppercase border px-4 py-1.5 transition-colors ${
            active === key
              ? 'text-white border-white/25 bg-white/5'
              : 'text-white/35 border-white/10 hover:text-white hover:border-white/25'
          }`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function AdminNav({ active }) {
  const links = [
    { href: '/admin/dashboard',   label: 'Dashboard'   },
    { href: '/admin/productos',   label: 'Productos'   },
    { href: '/admin/categorias',  label: 'Categorías'  },
    { href: '/admin/pedidos',     label: 'Pedidos'     },
    { href: '/admin/clientes',    label: 'Clientes'    },
    { href: '/admin/solicitudes', label: 'Solicitudes' },
  ];
  return (
    <div className="flex items-center gap-1 mb-8 -mx-1 flex-wrap">
      {links.map(({ href, label }) => (
        <Link key={href} href={href}
          className={`text-[10px] tracking-[0.25em] uppercase border px-4 py-2 transition-colors ${
            active === href
              ? 'text-white border-white/25 bg-white/5'
              : 'text-white/40 hover:text-white border-white/10 hover:border-white/30'
          }`}>
          {label}
        </Link>
      ))}
    </div>
  );
}

/* ─── Cambiar estado modal ───────────────────────────────────────────────── */
function CambiarEstadoModal({ pedido, token, onClose, onSuccess }) {
  const [estado, setEstado] = useState(pedido.estado ?? 'pendiente');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/pedidos/admin/${pedido.id}/estado`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess(pedido.id, res.data?.estado ?? estado);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Error al actualizar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-sm flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Cambiar estado</p>
            <p className="text-white text-sm font-bold tracking-wide mt-0.5">
              Pedido #{pedido.numero_pedido ?? pedido.id}
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1">Estado actual</p>
            <EstadoBadge estado={pedido.estado} />
          </div>
          <div>
            <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">Nuevo estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}
              className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-2.5 focus:outline-none focus:border-white/40 transition-colors tracking-wide appearance-none">
              {['pendiente','pagado','enviado','entregado','cancelado'].map((s) => (
                <option key={s} value={s}>{ESTADO_CFG[s]?.label ?? s}</option>
              ))}
            </select>
          </div>
          {error && (
            <div className="px-4 py-3 text-xs border"
              style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || estado === pedido.estado}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            ) : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirmar factura modal ────────────────────────────────────────────── */
function ConfirmarFacturaModal({ pedido, token, onClose, onConfirm, sending }) {
  const clienteNombre = pedido.usuario?.nombre ?? pedido.cliente_nombre ?? pedido.cliente?.nombre ?? pedido.cliente?.email ?? pedido.cliente ?? (pedido.usuario_id ? `Usuario #${pedido.usuario_id}` : '—');

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-sm flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Enviar factura</p>
            <p className="text-white text-sm font-bold tracking-wide mt-0.5">
              ¿Enviar factura al cliente?
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Order details */}
        <div className="px-6 py-5 flex flex-col gap-3 border-b border-white/[0.06]">
          {[
            ['Pedido',  `#${pedido.numero_pedido ?? pedido.id}`],
            ['Cliente', clienteNombre],
            ['Total',   pedido.total ? COP.format(Number(pedido.total)) : '—'],
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between">
              <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">{label}</p>
              <p className="text-white text-sm font-medium tracking-wide">{val}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 flex gap-3">
          <button onClick={onClose} disabled={sending}
            className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors disabled:opacity-40">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={sending}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {sending ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            ) : null}
            Sí, enviar factura
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Detalle pedido modal ───────────────────────────────────────────────── */
function DetallePedidoModal({ pedido, onClose }) {
  const guest = parseGuestNotas(pedido.notas);
  const isGuest = !pedido.usuario && guest;

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const Row = ({ label, value }) => value ? (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.06] last:border-0">
      <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase shrink-0">{label}</span>
      <span className="text-white text-xs text-right tracking-wide leading-relaxed">{value}</span>
    </div>
  ) : null;

  const clienteNombre = isGuest
    ? (guest.nombre || 'Invitado')
    : (pedido.usuario?.nombre ?? pedido.cliente_nombre ?? pedido.cliente?.nombre ?? pedido.cliente?.email ?? (pedido.usuario_id ? `Usuario #${pedido.usuario_id}` : '—'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-sm flex flex-col max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0d0d0d]">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Detalle del pedido</p>
            <p className="text-white text-sm font-bold tracking-wide mt-0.5">
              #{pedido.numero_pedido ?? pedido.id}
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-1">
          {/* Guest badge */}
          {isGuest && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase border px-2.5 py-1"
                style={{ color: '#fb923c', borderColor: 'rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.08)' }}>
                Invitado
              </span>
              <span className="text-white/25 text-[10px]">Pedido sin cuenta</span>
            </div>
          )}

          {/* Order info */}
          <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase mb-1">Pedido</p>
          <div className="mb-4">
            <Row label="ID"      value={`#${pedido.numero_pedido ?? pedido.id}`} />
            <Row label="Estado"  value={ESTADO_CFG[(pedido.estado ?? '').toLowerCase()]?.label ?? pedido.estado} />
            <Row label="Total"   value={pedido.total ? COP.format(Number(pedido.total)) : null} />
            <Row label="Fecha"   value={fmtFecha(pedido.creado_en ?? pedido.fecha_creacion ?? pedido.fecha)} />
            {pedido.metodo_pago && <Row label="Pago" value={pedido.metodo_pago} />}
          </div>

          {/* Contact info */}
          <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase mb-1">
            {isGuest ? 'Contacto (invitado)' : 'Cliente'}
          </p>
          <div className="mb-4">
            <Row label="Nombre"    value={clienteNombre} />
            {isGuest && <Row label="Email"    value={guest.email} />}
            {isGuest && <Row label="Celular"  value={guest.celular} />}
            {isGuest && <Row label="Dirección" value={guest.direccion} />}
            {!isGuest && pedido.usuario?.email && <Row label="Email" value={pedido.usuario.email} />}
          </div>

          {/* Items */}
          {Array.isArray(pedido.items) && pedido.items.length > 0 && (
            <>
              <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase mb-1">Productos</p>
              <div className="mb-4 flex flex-col gap-2">
                {pedido.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                    <div>
                      <p className="text-white text-xs tracking-wide">{item.producto?.nombre ?? item.nombre ?? `Producto #${item.producto_id}`}</p>
                      {item.talla && <p className="text-white/30 text-[10px] mt-0.5">Talla: {item.talla}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-white text-xs font-bold">{item.cantidad}×</p>
                      {item.precio_unitario && (
                        <p className="text-white/40 text-[10px]">{COP.format(Number(item.precio_unitario))}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Raw notas (if any non-guest or extra info) */}
          {pedido.notas && !isGuest && (
            <>
              <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase mb-1">Notas</p>
              <p className="text-white/50 text-xs leading-relaxed border border-white/[0.06] px-3 py-2">{pedido.notas}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="animate-pulse flex flex-col">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-white/5 bg-white/[0.015]" />
      ))}
    </div>
  );
}

/* ─── Action button ──────────────────────────────────────────────────────── */
function ActionBtn({ loading, onClick, children, style }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-1 text-white/40 hover:text-white text-[10px] tracking-[0.15em] uppercase border border-white/10 hover:border-white/35 px-2.5 py-1.5 transition-colors disabled:opacity-40 whitespace-nowrap"
      style={style}>
      {loading ? (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
          <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminPedidos() {
  const router = useRouter();
  const { usuario, token } = useAuth();

  const [mounted,  setMounted]  = useState(false);
  const [pedidos,  setPedidos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filter,   setFilter]   = useState('todos');
  const [modal,         setModal]         = useState(null);  // pedido for estado modal
  const [facturaModal,  setFacturaModal]  = useState(null);  // pedido for factura confirm
  const [detalleModal,  setDetalleModal]  = useState(null);  // pedido for detail view
  const [loadKey,       setLoadKey]       = useState(null);  // "${id}_confirmar"
  const [sendingFactura,setSendingFactura]= useState(false);
  const [feedback,      setFeedback]      = useState(null);  // { type:'ok'|'err', msg }

  useEffect(() => { setMounted(true); }, []);

  const fetchPedidos = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios.get('http://localhost:8000/api/pedidos/admin/todos', {
      params: { pagina: 1, tamano: 100 },
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const list = res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setPedidos(list);
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) router.replace('/login');
        else setError('No se pudo cargar los pedidos. Verifica la conexión.');
      })
      .finally(() => setLoading(false));
  }, [token, router]);

  useEffect(() => {
    if (!mounted) return;
    if (!token)           { router.replace('/login'); return; }
    if (!isAdmin(usuario)) { router.replace('/');     return; }
    fetchPedidos();
  }, [mounted, token, usuario, router, fetchPedidos]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmarPago = async (pedido) => {
    const key = `${pedido.id}_confirmar`;
    setLoadKey(key);
    try {
      await axios.post(
        `http://localhost:8000/api/pedidos/admin/${pedido.id}/confirmar-pago-tienda`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPedidos((prev) => prev.map((p) => p.id === pedido.id ? { ...p, estado: 'pagado' } : p));
      showFeedback('ok', `Pago confirmado para pedido #${pedido.numero_pedido ?? pedido.id}.`);
    } catch (err) {
      showFeedback('err', err.response?.data?.detail || 'Error al confirmar el pago.');
    } finally {
      setLoadKey(null);
    }
  };

  const handleEnviarFactura = async (pedido) => {
    setSendingFactura(true);
    try {
      await axios.post(
        `http://localhost:8000/api/pagos/${pedido.id}/enviar-factura`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFacturaModal(null);
      showFeedback('ok', '✅ Factura enviada correctamente.');
    } catch (err) {
      setFacturaModal(null);
      showFeedback('err', '❌ Error al enviar la factura.');
    } finally {
      setSendingFactura(false);
    }
  };

  const handleEstadoSuccess = (id, nuevoEstado) => {
    setPedidos((prev) => prev.map((p) => p.id === id ? { ...p, estado: nuevoEstado } : p));
  };

  const filtered = pedidos.filter((p) =>
    filter === 'todos' ? true : (p.estado ?? '').toLowerCase() === filter
  );

  const counts = FILTERS.reduce((acc, { key }) => {
    acc[key] = key === 'todos' ? pedidos.length : pedidos.filter((p) => (p.estado ?? '').toLowerCase() === key).length;
    return acc;
  }, {});

  return (
    <>
      {detalleModal && (
        <DetallePedidoModal
          pedido={detalleModal}
          onClose={() => setDetalleModal(null)}
        />
      )}
      {facturaModal && (
        <ConfirmarFacturaModal
          pedido={facturaModal}
          token={token}
          onClose={() => setFacturaModal(null)}
          onConfirm={() => handleEnviarFactura(facturaModal)}
          sending={sendingFactura}
        />
      )}
      {modal && (
        <CambiarEstadoModal
          pedido={modal}
          token={token}
          onClose={() => setModal(null)}
          onSuccess={handleEstadoSuccess}
        />
      )}

      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />

        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-10">

            <AdminNav active="/admin/pedidos" />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-8 border-b border-white/10">
              <div>
                <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase mb-2">Panel de administración</p>
                <h1 className="text-white font-black text-4xl uppercase tracking-tight"
                  style={{ fontFamily: "'Geist Sans','Arial Black',sans-serif" }}>
                  Pedidos
                </h1>
                {!loading && (
                  <p className="text-white/30 text-xs mt-2">
                    {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
                    {counts.pendiente > 0 && (
                      <span style={{ color: '#facc15' }}> · {counts.pendiente} pendiente{counts.pendiente !== 1 ? 's' : ''}</span>
                    )}
                    {counts.separado > 0 && (
                      <span style={{ color: '#c084fc' }}> · {counts.separado} separado{counts.separado !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                )}
              </div>
              <button onClick={fetchPedidos} disabled={loading}
                className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/15 hover:border-white/40 px-4 py-2 transition-colors disabled:opacity-40 self-start sm:self-auto">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Actualizar
              </button>
            </div>

            {/* ── Feedback toast ── */}
            {feedback && (
              <div className="border px-5 py-3 mb-6 text-sm transition-all"
                style={feedback.type === 'ok'
                  ? { color: '#4ade80', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.07)' }
                  : { color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
                {feedback.msg}
              </div>
            )}

            {/* ── Error ── */}
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 px-5 py-4 mb-8 flex items-center justify-between">
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={fetchPedidos} className="text-red-400/70 hover:text-red-400 text-xs tracking-widest uppercase transition-colors">Reintentar</button>
              </div>
            )}

            {/* ── Filters ── */}
            {!loading && pedidos.length > 0 && (
              <div className="mb-6">
                <FilterChips active={filter} onChange={setFilter} />
              </div>
            )}

            {/* ── Table ── */}
            {loading ? (
              <div className="bg-[#0d0d0d] border border-white/10"><TableSkeleton /></div>
            ) : filtered.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-3">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/12">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <p className="text-white/25 text-sm tracking-wide">
                  {filter === 'todos' ? 'No hay pedidos.' : `No hay pedidos ${FILTERS.find(f => f.key === filter)?.label.toLowerCase()}.`}
                </p>
                {filter !== 'todos' && (
                  <button onClick={() => setFilter('todos')}
                    className="text-white/30 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors">
                    Ver todos
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden">
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                  <h2 className="text-white/35 text-[10px] tracking-[0.35em] uppercase font-medium">Gestión de pedidos</h2>
                  <span className="text-white/25 text-[10px] tracking-wide">
                    {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        {[
                          { label: 'ID',       cls: 'w-20'               },
                          { label: 'Cliente',  cls: ''                   },
                          { label: 'Total',    cls: 'hidden sm:table-cell' },
                          { label: 'Estado',   cls: ''                   },
                          { label: 'Fecha',    cls: 'hidden md:table-cell' },
                          { label: 'Expira',   cls: 'hidden lg:table-cell' },
                          { label: 'Acciones', cls: ''                   },
                        ].map(({ label, cls }) => (
                          <th key={label}
                            className={`pb-3 px-4 first:px-6 text-[10px] tracking-[0.25em] uppercase text-white/25 font-medium pt-0 ${cls}`}>
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => {
                        const estado = (p.estado ?? '').toLowerCase();
                        const expira = fmtExpira(p.expira_en ?? p.expira);
                        const guest  = parseGuestNotas(p.notas);
                        const isGuest = !p.usuario && guest;
                        const clienteNombre = isGuest
                          ? (guest.nombre || 'Invitado')
                          : (p.usuario?.nombre ?? p.cliente_nombre ?? p.cliente?.nombre ?? p.cliente?.email ?? p.cliente ?? (p.usuario_id ? `Usuario #${p.usuario_id}` : '—'));
                        return (
                          <tr key={p.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors group">

                            {/* ID */}
                            <td className="py-3 px-6 text-white/40 text-xs font-mono">
                              #{p.numero_pedido ?? p.id}
                            </td>

                            {/* Cliente */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white text-sm tracking-wide">{clienteNombre}</span>
                                {isGuest && (
                                  <span className="text-[9px] tracking-[0.15em] uppercase border px-1.5 py-0.5 shrink-0"
                                    style={{ color: '#fb923c', borderColor: 'rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.08)' }}>
                                    Invitado
                                  </span>
                                )}
                              </div>
                              {isGuest && guest.celular && (
                                <p className="text-white/30 text-[10px] mt-0.5 tracking-wide">{guest.celular}</p>
                              )}
                            </td>

                            {/* Total */}
                            <td className="py-3 px-4 hidden sm:table-cell text-white text-sm font-bold whitespace-nowrap">
                              {p.total ? COP.format(Number(p.total)) : '—'}
                            </td>

                            {/* Estado */}
                            <td className="py-3 px-4">
                              <EstadoBadge estado={p.estado} />
                            </td>

                            {/* Fecha */}
                            <td className="py-3 px-4 hidden md:table-cell text-white/35 text-xs">
                              {fmtFecha(p.creado_en ?? p.fecha_creacion ?? p.fecha)}
                            </td>

                            {/* Expira */}
                            <td className="py-3 px-4 hidden lg:table-cell">
                              {estado === 'separado' && expira ? (
                                <span className="text-xs font-bold" style={{ color: expira.color }}>
                                  {expira.text}
                                </span>
                              ) : (
                                <span className="text-white/15 text-xs">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 pr-6">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <ActionBtn loading={false} onClick={() => setDetalleModal(p)}>
                                  Ver
                                </ActionBtn>
                                {estado === 'separado' && (
                                  <ActionBtn
                                    loading={loadKey === `${p.id}_confirmar`}
                                    onClick={() => handleConfirmarPago(p)}
                                    style={{ color: '#c084fc', borderColor: 'rgba(192,132,252,0.25)' }}
                                  >
                                    Confirmar pago
                                  </ActionBtn>
                                )}
                                <ActionBtn loading={false} onClick={() => setModal(p)}>
                                  Estado
                                </ActionBtn>
                                {estado === 'pagado' && (
                                  <ActionBtn
                                    loading={loadKey === `${p.id}_factura`}
                                    onClick={() => setFacturaModal(p)}
                                    style={{ color: '#60a5fa', borderColor: 'rgba(96,165,250,0.25)' }}
                                  >
                                    Factura
                                  </ActionBtn>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
