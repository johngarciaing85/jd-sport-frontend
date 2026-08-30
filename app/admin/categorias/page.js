'use client';
import { API_URL, safeErrorMessage } from '@/lib/api';
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

/* --- Admin nav ------------------------------------------------------------ */
function AdminNav({ active }) {
  const links = [
    { href: '/admin/dashboard',   label: 'Dashboard'    },
    { href: '/admin/productos',   label: 'Productos'    },
    { href: '/admin/categorias',  label: 'Categorias'   },
    { href: '/admin/pedidos',     label: 'Pedidos'      },
    { href: '/admin/clientes',    label: 'Clientes'     },
    { href: '/admin/solicitudes', label: 'Solicitudes'  },
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

/* --- Modal (create + edit) ------------------------------------------------ */
function CategoriaModal({ categoria, token, onClose, onSuccess }) {
  const isEdit = !!categoria;

  const [nombre,      setNombre]      = useState(categoria?.nombre      ?? '');
  const [descripcion, setDescripcion] = useState(categoria?.descripcion ?? '');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSave = async () => {
    if (!nombre.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true);
    setError(null);
    try {
      let result;
      if (isEdit) {
        const res = await axios.put(
          `${API_URL}/categorias/${categoria.id}`,
          { nombre: nombre.trim(), descripcion: descripcion.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        result = res.data;
      } else {
        const res = await axios.post(
          `${API_URL}/categorias/`,
          { nombre: nombre.trim(), descripcion: descripcion.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        result = res.data;
      }
      onSuccess(result, isEdit);
      onClose();
    } catch (err) {
      setError(safeErrorMessage(err, isEdit ? 'Error al actualizar.' : 'Error al crear.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">
              {isEdit ? 'Editar categoria' : 'Nueva categoria'}
            </p>
            {isEdit && (
              <p className="text-white text-sm font-bold tracking-wide mt-0.5">{categoria.nombre}</p>
            )}
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Nombre */}
          <div>
            <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Running"
              className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide"
            />
          </div>

          {/* Descripcion */}
          <div>
            <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
              Descripcion
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Descripcion de la categoria..."
              className="w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 text-xs border"
              style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {saving && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            )}
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear categoria'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Confirm delete modal ------------------------------------------------- */
function EliminarModal({ categoria, token, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await axios.delete(
        `${API_URL}/categorias/${categoria.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess(categoria.id);
      onClose();
    } catch (err) {
      setError(safeErrorMessage(err, 'Error al eliminar.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Eliminar categoria</p>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-white text-sm tracking-wide">
            &iquest;Eliminar categoria <span className="font-bold">{categoria.nombre}</span>?
          </p>
          <p className="text-white/40 text-xs tracking-wide">Esta accion no se puede deshacer.</p>
          {error && (
            <div className="px-4 py-3 text-xs border"
              style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors disabled:opacity-40">
            Cancelar
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
            {deleting ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            ) : null}
            {deleting ? 'Eliminando...' : 'Si, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Skeleton ------------------------------------------------------------- */
function TableSkeleton() {
  return (
    <div className="animate-pulse flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 border-b border-white/5 bg-white/[0.015]" />
      ))}
    </div>
  );
}

/* --- Page ----------------------------------------------------------------- */
export default function AdminCategorias() {
  const router = useRouter();
  const { usuario, token } = useAuth();

  const [mounted,    setMounted]    = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [modal,          setModal]          = useState(null); // null | 'new' | categoria object
  const [eliminarModal,  setEliminarModal]  = useState(null); // null | categoria object

  useEffect(() => { setMounted(true); }, []);

  const fetchCategorias = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${API_URL}/categorias/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setCategorias(list);
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.replace('/login');
        } else {
          setError('No se pudo cargar las categorias. Verifica la conexion.');
        }
      })
      .finally(() => setLoading(false));
  }, [token, router]);

  useEffect(() => {
    if (!mounted) return;
    if (!token)            { router.replace('/login'); return; }
    if (!isAdmin(usuario)) { router.replace('/');     return; }
    fetchCategorias();
  }, [mounted, token, usuario, router, fetchCategorias]);

  const handleSuccess = (result, isEdit) => {
    if (isEdit) {
      setCategorias((prev) => prev.map((c) => c.id === result.id ? { ...c, ...result } : c));
    } else {
      setCategorias((prev) => [...prev, result]);
    }
  };

  const handleDeleted = (id) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  if (!mounted) return null;

  return (
    <>
      {eliminarModal && (
        <EliminarModal
          categoria={eliminarModal}
          token={token}
          onClose={() => setEliminarModal(null)}
          onSuccess={handleDeleted}
        />
      )}
      {modal && (
        <CategoriaModal
          categoria={modal === 'new' ? null : modal}
          token={token}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />

        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-10">

            <AdminNav active="/admin/categorias" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-8 border-b border-white/10">
              <div>
                <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase mb-2">
                  Panel de administracion
                </p>
                <h1
                  className="text-white font-black text-4xl uppercase tracking-tight"
                  style={{ fontFamily: "'Geist Sans','Arial Black',sans-serif" }}
                >
                  Categorias
                </h1>
                {!loading && (
                  <p className="text-white/30 text-xs mt-2">
                    {categorias.length} categoria{categorias.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setModal('new')}
                  className="flex items-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-2 hover:bg-white/90 transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Nueva Categoria
                </button>
                <button
                  onClick={fetchCategorias}
                  disabled={loading}
                  className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/15 hover:border-white/40 px-4 py-2 transition-colors disabled:opacity-40"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  Actualizar
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 px-5 py-4 mb-8 flex items-center justify-between">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchCategorias}
                  className="text-red-400/70 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Table */}
            {loading ? (
              <div className="bg-[#0d0d0d] border border-white/10">
                <TableSkeleton />
              </div>
            ) : categorias.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/12">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <p className="text-white/25 text-sm tracking-wide">No hay categorias.</p>
                <button
                  onClick={() => setModal('new')}
                  className="text-white/40 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/15 hover:border-white/30 px-4 py-2 transition-colors"
                >
                  Crear primera categoria
                </button>
              </div>
            ) : (
              <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden">
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                  <h2 className="text-white/35 text-[10px] tracking-[0.35em] uppercase font-medium">
                    Catalogo de categorias
                  </h2>
                  <span className="text-white/25 text-[10px] tracking-wide">
                    {categorias.length} categoria{categorias.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        {[
                          { label: 'ID',         cls: 'w-16'                 },
                          { label: 'Nombre',     cls: ''                     },
                          { label: 'Descripcion',cls: 'hidden md:table-cell' },
                          { label: '',           cls: ''                     },
                        ].map(({ label, cls }) => (
                          <th
                            key={label || 'action'}
                            className={`pb-3 px-4 first:px-6 text-[10px] tracking-[0.25em] uppercase text-white/25 font-medium pt-0 ${cls}`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map((c) => (
                          <tr
                            key={c.id}
                            className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors group"
                          >
                            {/* ID */}
                            <td className="py-3 px-4 text-white/40 text-xs font-mono">
                              #{c.id}
                            </td>

                            {/* Nombre */}
                            <td className="py-3 px-4">
                              <span className="text-white text-sm tracking-wide font-medium">
                                {c.nombre}
                              </span>
                            </td>

                            {/* Descripcion */}
                            <td className="py-3 px-4 hidden md:table-cell max-w-xs">
                              <span className="text-white/40 text-xs line-clamp-2">
                                {c.descripcion || '—'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setModal(c)}
                                className="flex items-center gap-1.5 text-white/40 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:border-white/35 px-3 py-1.5 transition-colors group-hover:border-white/20"
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Editar
                              </button>
                              <button
                                onClick={() => setEliminarModal(c)}
                                className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase border px-3 py-1.5 transition-colors"
                                style={{ color: 'rgba(248,113,113,0.7)', borderColor: 'rgba(248,113,113,0.2)', background: 'transparent' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(248,113,113,0.7)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                                Eliminar
                              </button>
                              </div>
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