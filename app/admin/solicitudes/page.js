'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth';

function isAdmin(u) {
  return (
    u?.rol === 'admin' ||
    u?.role === 'admin' ||
    u?.is_admin === true ||
    u?.is_staff === true ||
    u?.es_admin === true
  );
}

/* ─── Config ─────────────────────────────────────────────────────────────── */
const ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: '#facc15', bg: 'rgba(250,204,21,0.12)',   border: 'rgba(250,204,21,0.3)'  },
  aprobada:   { label: 'Aprobada',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   border: 'rgba(96,165,250,0.3)'  },
  rechazada:  { label: 'Rechazada',  color: '#f87171', bg: 'rgba(248,113,113,0.12)',  border: 'rgba(248,113,113,0.3)' },
  completada: { label: 'Completada', color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   border: 'rgba(74,222,128,0.3)'  },
};

const TIPO_LABEL = {
  garantia:  'Garantía',
  garantía:  'Garantía',
  cambio:    'Cambio',
};

function estadoCfg(estado) {
  return ESTADO_CONFIG[estado?.toLowerCase()] ?? { label: estado ?? '—', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' };
}

function tipoLabel(tipo) {
  return TIPO_LABEL[tipo?.toLowerCase()] ?? tipo ?? '—';
}

function fmtFecha(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Estado badge ───────────────────────────────────────────────────────── */
function EstadoBadge({ estado }) {
  const cfg = estadoCfg(estado);
  return (
    <span
      className="text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5 whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

/* ─── Resolver modal ─────────────────────────────────────────────────────── */
function ResolverModal({ solicitud, token, onClose, onSuccess }) {
  const [estado, setEstado] = useState(solicitud.estado ?? 'pendiente');
  const [notas, setNotas] = useState(solicitud.notas_admin ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/solicitudes/admin/${solicitud.id}/resolver`,
        { estado, notas_admin: notas },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess(solicitud.id, res.data);
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail)
        ? detail.map(e => e.msg).join(', ')
        : (typeof detail === 'string' ? detail : (err.response?.data?.message || 'Error al guardar. Intenta de nuevo.'));
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const cfg = estadoCfg(solicitud.estado);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-lg flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Resolver solicitud</p>
            <p className="text-white text-sm font-bold tracking-wide mt-0.5">
              #{solicitud.id} · {tipoLabel(solicitud.tipo)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors p-1"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className="px-6 pt-5 pb-2 grid grid-cols-2 gap-x-6 gap-y-3 border-b border-white/[0.06]">
          {[
            ['Cliente',   solicitud.cliente_nombre  ?? solicitud.cliente ?? '—'],
            ['Producto',  solicitud.producto_nombre ?? solicitud.producto?.nombre ?? solicitud.producto_cambio?.nombre ?? '—'],
            ['Factura',   solicitud.numero_factura   ?? solicitud.factura  ?? '—'],
            ['Fecha',     fmtFecha(solicitud.fecha_creacion ?? solicitud.fecha)],
          ].map(([label, val]) => (
            <div key={label} className="pb-3">
              <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-0.5">{label}</p>
              <p className="text-white text-sm tracking-wide">{val}</p>
            </div>
          ))}
          <div className="pb-3">
            <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1">Estado actual</p>
            <EstadoBadge estado={solicitud.estado} />
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Estado select */}
          <div>
            <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
              Nuevo estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-2.5 focus:outline-none focus:border-white/40 transition-colors tracking-wide appearance-none"
            >
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          {/* Notas textarea */}
          <div>
            <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
              Notas administrativas
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Agrega notas sobre la decisión…"
              className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 text-xs tracking-wide border"
              style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Guardando…
              </>
            ) : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Filter chips ───────────────────────────────────────────────────────── */
const FILTERS = [
  { key: 'todas',     label: 'Todas'     },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobada',  label: 'Aprobadas'  },
  { key: 'rechazada', label: 'Rechazadas' },
];

function FilterChips({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`text-[10px] tracking-[0.2em] uppercase border px-4 py-1.5 transition-colors ${
            active === key
              ? 'text-white border-white/25 bg-white/5'
              : 'text-white/35 border-white/10 hover:text-white hover:border-white/25'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="animate-pulse flex flex-col">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-white/5 bg-white/[0.015]" />
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminSolicitudes() {
  const router = useRouter();
  const { usuario, token } = useAuth();

  const [mounted, setMounted]         = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState('todas');
  const [modal, setModal]             = useState(null); // solicitud object

  useEffect(() => { setMounted(true); }, []);

  const fetchSolicitudes = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios
      .get('http://localhost:8000/api/solicitudes/admin/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setSolicitudes(list);
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.replace('/login');
        } else {
          setError('No se pudo cargar las solicitudes. Verifica la conexión.');
        }
      })
      .finally(() => setLoading(false));
  }, [token, router]);

  useEffect(() => {
    if (!mounted) return;
    if (!token) { router.replace('/login'); return; }
    if (!isAdmin(usuario)) { router.replace('/'); return; }
    fetchSolicitudes();
  }, [mounted, token, usuario, router, fetchSolicitudes]);

  const handleResolved = (id, updated) => {
    setSolicitudes((prev) =>
      prev.map((s) => s.id === id ? { ...s, ...updated } : s)
    );
  };

  const filtered = solicitudes.filter((s) => {
    if (filter === 'todas') return true;
    return (s.estado ?? '').toLowerCase() === filter;
  });

  const pendingCount = solicitudes.filter((s) => (s.estado ?? '').toLowerCase() === 'pendiente').length;

  return (
    <>
      {modal && (
        <ResolverModal
          solicitud={modal}
          token={token}
          onClose={() => setModal(null)}
          onSuccess={handleResolved}
        />
      )}

      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />

        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-10">

            {/* ── Admin nav ── */}
            <div className="flex items-center gap-1 mb-8 -mx-1 flex-wrap">
              <Link
                href="/admin/dashboard"
                className="text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/productos"
                className="text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
              >
                Productos
              </Link>
              <Link
                href="/admin/categorias"
                className="text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
              >
                Categorías
              </Link>
              <Link
                href="/admin/pedidos"
                className="text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
              >
                Pedidos
              </Link>
              <Link
                href="/admin/clientes"
                className="text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
              >
                Clientes
              </Link>
              <Link
                href="/admin/solicitudes"
                className="text-white text-[10px] tracking-[0.25em] uppercase border border-white/25 bg-white/5 px-4 py-2 transition-colors"
              >
                Solicitudes
              </Link>
            </div>

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-8 border-b border-white/10">
              <div>
                <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase mb-2">
                  Panel de administración
                </p>
                <h1
                  className="text-white font-black text-4xl uppercase tracking-tight"
                  style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
                >
                  Solicitudes
                </h1>
                {!loading && (
                  <p className="text-white/30 text-xs mt-2">
                    {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}
                    {pendingCount > 0 && (
                      <span style={{ color: '#facc15' }}> · {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={fetchSolicitudes}
                disabled={loading}
                className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/15 hover:border-white/40 px-4 py-2 transition-colors disabled:opacity-40 self-start sm:self-auto"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Actualizar
              </button>
            </div>

            {/* ── Error ── */}
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 px-5 py-4 mb-8 flex items-center justify-between">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchSolicitudes}
                  className="text-red-400/70 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* ── Filters ── */}
            {!loading && solicitudes.length > 0 && (
              <div className="mb-6">
                <FilterChips active={filter} onChange={setFilter} />
              </div>
            )}

            {/* ── Table ── */}
            {loading ? (
              <div className="bg-[#0d0d0d] border border-white/10">
                <TableSkeleton />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-3">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/12">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="text-white/25 text-sm tracking-wide">
                  {filter === 'todas' ? 'No hay solicitudes.' : `No hay solicitudes ${FILTERS.find(f => f.key === filter)?.label.toLowerCase() ?? ''}.`}
                </p>
                {filter !== 'todas' && (
                  <button
                    onClick={() => setFilter('todas')}
                    className="text-white/30 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
                  >
                    Ver todas
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden">
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                  <h2 className="text-white/35 text-[10px] tracking-[0.35em] uppercase font-medium">
                    Gestión de garantías y cambios
                  </h2>
                  <span className="text-white/25 text-[10px] tracking-wide">
                    {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        {[
                          { label: 'ID',       cls: 'w-16'                      },
                          { label: 'Tipo',     cls: 'hidden sm:table-cell'      },
                          { label: 'Estado',   cls: ''                          },
                          { label: 'Cliente',  cls: ''                          },
                          { label: 'Producto', cls: 'hidden md:table-cell'      },
                          { label: 'Factura',  cls: 'hidden lg:table-cell'      },
                          { label: 'Fecha',    cls: 'hidden lg:table-cell'      },
                          { label: '',         cls: ''                          },
                        ].map(({ label, cls }) => (
                          <th
                            key={label || 'action'}
                            className={`pb-3 px-4 first:px-6 last:px-6 text-[10px] tracking-[0.25em] uppercase text-white/25 font-medium pt-0 ${cls}`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* ID */}
                          <td className="py-3 px-6 text-white/40 text-xs font-mono">
                            #{s.id}
                          </td>

                          {/* Tipo */}
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className="text-white/60 text-xs tracking-wide">
                              {tipoLabel(s.tipo)}
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-4">
                            <EstadoBadge estado={s.estado} />
                          </td>

                          {/* Cliente */}
                          <td className="py-3 px-4">
                            <span className="text-white text-sm tracking-wide">
                              {s.cliente_nombre ?? s.cliente ?? '—'}
                            </span>
                          </td>

                          {/* Producto */}
                          <td className="py-3 px-4 hidden md:table-cell">
                            <span className="text-white/60 text-sm tracking-wide">
                              {s.producto_nombre ?? s.producto?.nombre ?? s.producto_cambio?.nombre ?? '—'}
                            </span>
                          </td>

                          {/* Factura */}
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <span className="text-white/40 text-xs font-mono">
                              {s.numero_factura ?? s.factura ?? '—'}
                            </span>
                          </td>

                          {/* Fecha */}
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <span className="text-white/35 text-xs">
                              {fmtFecha(s.fecha_creacion ?? s.fecha)}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-6 text-right">
                            <button
                              onClick={() => setModal(s)}
                              className="flex items-center gap-1.5 ml-auto text-white/40 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:border-white/35 px-3 py-1.5 transition-colors group-hover:border-white/20"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 11 12 14 22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                              </svg>
                              Resolver
                            </button>
                          </td>
                        </tr>
                      ))}
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
