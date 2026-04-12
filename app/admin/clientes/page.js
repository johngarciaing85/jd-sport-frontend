'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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

function fmtFecha(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return v;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

const FILTERS = [
  { key: 'todos',    label: 'Todos'     },
  { key: 'activos',  label: 'Activos'   },
  { key: 'inactivos',label: 'Inactivos' },
];

/* ─── Admin nav ──────────────────────────────────────────────────────────── */
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

/* ─── Activo badge ───────────────────────────────────────────────────────── */
function ActivoBadge({ activo }) {
  return activo ? (
    <span className="text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5"
      style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)' }}>
      Activo
    </span>
  ) : (
    <span className="text-[10px] tracking-[0.15em] uppercase border px-2 py-0.5"
      style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)' }}>
      Inactivo
    </span>
  );
}

/* ─── Filter chips ───────────────────────────────────────────────────────── */
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

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminClientes() {
  const router = useRouter();
  const { usuario, token } = useAuth();

  const [mounted,   setMounted]   = useState(false);
  const [clientes,  setClientes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [filter,    setFilter]    = useState('todos');
  const [togglingId, setTogglingId] = useState(null);
  const [feedback,  setFeedback]  = useState(null);
  const [search,    setSearch]    = useState('');
  const searchRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  const fetchClientes = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios.get('http://localhost:8000/api/usuarios/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const list = res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setClientes(list);
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) router.replace('/login');
        else setError('No se pudo cargar los clientes. Verifica la conexión.');
      })
      .finally(() => setLoading(false));
  }, [token, router]);

  useEffect(() => {
    if (!mounted) return;
    if (!token)            { router.replace('/login'); return; }
    if (!isAdmin(usuario)) { router.replace('/');     return; }
    fetchClientes();
  }, [mounted, token, usuario, router, fetchClientes]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggle = async (cliente) => {
    setTogglingId(cliente.id);
    try {
      await axios.put(
        `http://localhost:8000/api/usuarios/${cliente.id}/desactivar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const esActivo = cliente.activo ?? cliente.is_active ?? true;
      setClientes((prev) =>
        prev.map((c) =>
          c.id === cliente.id
            ? { ...c, activo: !esActivo, is_active: !esActivo }
            : c
        )
      );
      const nombre = cliente.nombre ?? cliente.first_name ?? cliente.email ?? `#${cliente.id}`;
      showFeedback('ok', `${nombre} ${esActivo ? 'desactivado' : 'activado'} correctamente.`);
    } catch (err) {
      showFeedback('err', err.response?.data?.detail || 'Error al cambiar el estado del cliente.');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = clientes.filter((c) => {
    const esActivo = c.activo ?? c.is_active ?? true;
    const matchFilter =
      filter === 'todos' ? true :
      filter === 'activos' ? esActivo :
      !esActivo;

    if (!matchFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const nombre  = (c.nombre ?? c.first_name ?? '').toLowerCase();
    const email   = (c.email ?? '').toLowerCase();
    const telefono = (c.telefono ?? c.phone ?? '').toLowerCase();
    return nombre.includes(q) || email.includes(q) || telefono.includes(q);
  });

  const activosCount   = clientes.filter((c) => c.activo ?? c.is_active ?? true).length;
  const inactivosCount = clientes.length - activosCount;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-10">

          <AdminNav active="/admin/clientes" />

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-8 border-b border-white/10">
            <div>
              <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase mb-2">Panel de administración</p>
              <h1 className="text-white font-black text-4xl uppercase tracking-tight"
                style={{ fontFamily: "'Geist Sans','Arial Black',sans-serif" }}>
                Clientes
              </h1>
              {!loading && (
                <p className="text-white/30 text-xs mt-2">
                  {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
                  {activosCount > 0 && <span style={{ color: '#4ade80' }}> · {activosCount} activos</span>}
                  {inactivosCount > 0 && <span style={{ color: '#f87171' }}> · {inactivosCount} inactivos</span>}
                </p>
              )}
            </div>
            <button onClick={fetchClientes} disabled={loading}
              className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/15 hover:border-white/40 px-4 py-2 transition-colors disabled:opacity-40 self-start sm:self-auto">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Actualizar
            </button>
          </div>

          {/* ── Feedback ── */}
          {feedback && (
            <div className="border px-5 py-3 mb-6 text-sm"
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
              <button onClick={fetchClientes} className="text-red-400/70 hover:text-red-400 text-xs tracking-widest uppercase transition-colors">Reintentar</button>
            </div>
          )}

          {/* ── Filters + search ── */}
          {!loading && clientes.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <FilterChips active={filter} onChange={setFilter} />
              <div className="relative sm:ml-auto w-full sm:w-72">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, email o teléfono…"
                  className="w-full bg-[#0d0d0d] border border-white/15 text-white text-sm pl-9 pr-8 py-1.5 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    aria-label="Limpiar búsqueda"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Table ── */}
          {loading ? (
            <div className="bg-[#0d0d0d] border border-white/10"><TableSkeleton /></div>
          ) : filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/12">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p className="text-white/25 text-sm tracking-wide">
                {search ? 'Sin resultados para tu búsqueda.' : `No hay clientes ${filter !== 'todos' ? filter : ''}.`.trim()}
              </p>
              {(search || filter !== 'todos') && (
                <button onClick={() => { setSearch(''); setFilter('todos'); }}
                  className="text-white/30 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden">
              <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                <h2 className="text-white/35 text-[10px] tracking-[0.35em] uppercase font-medium">Base de clientes</h2>
                <span className="text-white/25 text-[10px] tracking-wide">
                  {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      {[
                        { label: 'ID',       cls: 'w-16'                  },
                        { label: 'Nombre',   cls: ''                      },
                        { label: 'Email',    cls: 'hidden sm:table-cell'  },
                        { label: 'Teléfono', cls: 'hidden md:table-cell'  },
                        { label: 'Registro', cls: 'hidden lg:table-cell'  },
                        { label: 'Estado',   cls: ''                      },
                        { label: '',         cls: ''                      },
                      ].map(({ label, cls }) => (
                        <th key={label || 'action'}
                          className={`pb-3 px-4 first:px-6 text-[10px] tracking-[0.25em] uppercase text-white/25 font-medium pt-0 ${cls}`}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const esActivo = c.activo ?? c.is_active ?? true;
                      const nombre   = (c.nombre ?? [c.first_name, c.last_name].filter(Boolean).join(' ')) || '—';
                      const telefono = c.telefono ?? c.phone ?? '—';
                      return (
                        <tr key={c.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors group">

                          {/* ID */}
                          <td className="py-3 px-6 text-white/40 text-xs font-mono">#{c.id}</td>

                          {/* Nombre */}
                          <td className="py-3 px-4">
                            <p className="text-white text-sm tracking-wide">{nombre}</p>
                          </td>

                          {/* Email */}
                          <td className="py-3 px-4 hidden sm:table-cell text-white/50 text-sm">
                            {c.email ?? '—'}
                          </td>

                          {/* Teléfono */}
                          <td className="py-3 px-4 hidden md:table-cell text-white/40 text-xs">
                            {telefono}
                          </td>

                          {/* Fecha registro */}
                          <td className="py-3 px-4 hidden lg:table-cell text-white/35 text-xs">
                            {fmtFecha(c.fecha_registro ?? c.date_joined ?? c.created_at)}
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-4">
                            <ActivoBadge activo={esActivo} />
                          </td>

                          {/* Toggle */}
                          <td className="py-3 px-4 pr-6 text-right">
                            <button
                              onClick={() => handleToggle(c)}
                              disabled={togglingId === c.id}
                              className="flex items-center gap-1.5 ml-auto text-white/40 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:border-white/35 px-3 py-1.5 transition-colors group-hover:border-white/20 disabled:opacity-40"
                              style={esActivo
                                ? { color: 'rgba(248,113,113,0.7)', borderColor: 'rgba(248,113,113,0.2)' }
                                : { color: 'rgba(74,222,128,0.7)',  borderColor: 'rgba(74,222,128,0.2)'  }}
                            >
                              {togglingId === c.id ? (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                              ) : null}
                              {esActivo ? 'Desactivar' : 'Activar'}
                            </button>
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
  );
}
