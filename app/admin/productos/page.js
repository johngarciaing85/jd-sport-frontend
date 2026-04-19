'use client';
// Ruta: app/admin/productos/page.js
import { API_URL } from '@/lib/api';
import { useState, useEffect, useRef, useCallback } from 'react';
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

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/* ─── Upload modal ───────────────────────────────────────────────────────── */
function UploadModal({ producto, token, onClose, onSuccess }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok'|'err', msg }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setStatus(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const form = new FormData();
      form.append('imagen', file);
      const res = await axios.post(
        `${API_URL}/productos/${producto.id}/imagen`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const url =
        res.data?.imagen ||
        res.data?.imagen_url ||
        res.data?.url ||
        preview;
      setStatus({ type: 'ok', msg: 'Imagen actualizada correctamente.' });
      onSuccess(producto.id, url);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail)
        ? detail.map(e => e.msg).join(', ')
        : (typeof detail === 'string' ? detail : (err.response?.data?.message || 'Error al subir la imagen. Intenta de nuevo.'));
      setStatus({ type: 'err', msg: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Subir imagen</p>
            <p className="text-white text-sm font-bold tracking-wide mt-0.5 truncate max-w-xs">
              {producto.nombre}
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

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">

          {/* 3:4 preview */}
          <div
            className="w-full bg-[#111] border border-white/10 overflow-hidden mx-auto"
            style={{ aspectRatio: '3/4', maxWidth: 220 }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : producto.imagen || producto.imagen_url ? (
              <img
                src={producto.imagen || producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/15">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase">Sin imagen</p>
              </div>
            )}
          </div>

          {/* File trigger */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/15 hover:border-white/40 py-3 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {file ? file.name : 'Seleccionar archivo'}
          </button>
          <p className="text-white/20 text-[10px] tracking-wide text-center -mt-2">
            JPG, PNG o WEBP
          </p>

          {/* Status */}
          {status && (
            <div
              className="px-4 py-3 text-xs tracking-wide border"
              style={
                status.type === 'ok'
                  ? { color: '#4ade80', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.07)' }
                  : { color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }
              }
            >
              {status.msg}
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
            disabled={!file || uploading || status?.type === 'ok'}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Guardando...
              </>
            ) : status?.type === 'ok' ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete modal ───────────────────────────────────────────────────────── */
function DeleteModal({ producto, onClose, onConfirm, deleting }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !deleting) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, deleting]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !deleting) onClose(); }}
    >
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-sm flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: '#f87171' }}>
            Eliminar producto
          </p>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-white/30 hover:text-white transition-colors p-1 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-7 flex flex-col gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 border mx-auto"
            style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-bold tracking-wide mb-1">
              ¿Estás seguro de eliminar
            </p>
            <p className="text-white font-black text-base tracking-wide truncate px-2">
              {producto.nombre}
            </p>
            <p className="text-white/35 text-xs mt-3 tracking-wide leading-relaxed">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: deleting ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.9)',
              color: '#000',
            }}
          >
            {deleting ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Eliminando...
              </>
            ) : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Product row ────────────────────────────────────────────────────────── */
function ProductRow({ producto, onOpenModal, onDelete }) {
  const imgSrc = producto.imagen || producto.imagen_url || null;

  return (
    <tr className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors group">

      {/* Thumbnail 3:4 */}
      <td className="py-3 px-6 w-16">
        <div
          className="bg-[#111] border border-white/10 overflow-hidden"
          style={{ width: 44, height: 59 }}
        >
          {imgSrc ? (
            <img src={imgSrc} alt={producto.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>
      </td>

      {/* Name */}
      <td className="py-3 px-4">
        <Link
          href={`/productos/${producto.id}`}
          className="text-white text-sm hover:text-white/70 transition-colors tracking-wide"
        >
          {producto.nombre}
        </Link>
        {producto.categoria && (
          <p className="text-white/30 text-[10px] mt-0.5 tracking-wide">
            {producto.categoria?.nombre ?? producto.categoria}
          </p>
        )}
      </td>

      {/* Price */}
      <td className="py-3 px-4 text-white text-sm font-bold whitespace-nowrap hidden sm:table-cell">
        {producto.precio ? COP.format(Number(producto.precio)) : '—'}
      </td>

      {/* Stock */}
      <td className="py-3 px-4 hidden md:table-cell">
        {(() => {
          const totalStock = Array.isArray(producto.tallas_stock) && producto.tallas_stock.length > 0
            ? producto.tallas_stock.reduce((sum, t) => sum + (Number(t.stock) || 0), 0)
            : producto.stock != null ? Number(producto.stock) : null;
          if (totalStock === null) return <span className="text-white/25 text-xs">—</span>;
          return (
            <span
              className="text-sm font-bold"
              style={{
                color:
                  totalStock <= 2  ? '#f87171' :
                  totalStock <= 10 ? '#facc15' : '#4ade80',
              }}
            >
              {totalStock}
            </span>
          );
        })()}
      </td>

      {/* Actions */}
      <td className="py-3 px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/productos/${producto.id}/editar`}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:border-white/35 px-3 py-1.5 transition-colors group-hover:border-white/20"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </Link>
          <button
            onClick={() => onOpenModal(producto)}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:border-white/35 px-3 py-1.5 transition-colors group-hover:border-white/20"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Imagen
          </button>
          <button
            onClick={() => onDelete(producto)}
            className="flex items-center gap-1.5 text-white/25 hover:text-[#f87171] text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:border-[rgba(248,113,113,0.4)] px-3 py-1.5 transition-colors group-hover:border-white/20"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="animate-pulse flex flex-col">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 border-b border-white/5 bg-white/[0.015]" />
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminProductos() {
  const router = useRouter();
  const { usuario, token } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // producto a eliminar
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProductos = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${API_URL}/productos/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log('[Productos] response:', res.data);
        const list = res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setProductos(list);
      })
      .catch((err) => {
        console.log('[Productos] error:', err.response?.status, err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.replace('/login');
        } else {
          setError('No se pudo cargar los productos. Verifica la conexión.');
        }
      })
      .finally(() => setLoading(false));
  }, [token, router]);

  useEffect(() => {
    if (!mounted) return;
    if (!token) { router.replace('/login'); return; }
    if (!isAdmin(usuario)) { router.replace('/'); return; }
    fetchProductos();
  }, [mounted, token, usuario, router, fetchProductos]);

  // Re-fetch when the tab regains focus (e.g. returning from edit page)
  useEffect(() => {
    if (!mounted) return;
    const onFocus = () => fetchProductos();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [mounted, fetchProductos]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/productos/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('[Delete] error →', err.response?.status, err.response?.data);
    } finally {
      setDeleting(false);
    }
  };

  const handleSuccess = (id, url) => {
    setProductos((prev) =>
      prev.map((p) => p.id === id ? { ...p, imagen: url, imagen_url: url } : p)
    );
  };

  const filtered = productos.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.nombre ?? '').toLowerCase().includes(q) ||
      (p.categoria?.nombre ?? p.categoria ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      {modal && (
        <UploadModal
          producto={modal}
          token={token}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          producto={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
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
                className="text-white text-[10px] tracking-[0.25em] uppercase border border-white/25 bg-white/5 px-4 py-2 transition-colors"
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
                className="text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
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
                  Productos
                </h1>
                {!loading && (
                  <p className="text-white/30 text-xs mt-2">
                    {productos.length} producto{productos.length !== 1 ? 's' : ''} registrados
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/admin/productos/nuevo"
                className="flex items-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase px-4 py-2 hover:bg-white/90 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nuevo Producto
              </Link>
              <button
                onClick={fetchProductos}
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

            {/* ── Error ── */}
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 px-5 py-4 mb-8 flex items-center justify-between">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchProductos}
                  className="text-red-400/70 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* ── Search ── */}
            {!loading && productos.length > 0 && (
              <div className="mb-6">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o categoría…"
                  className="w-full sm:w-72 bg-[#0d0d0d] border border-white/15 text-white text-sm px-4 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide"
                />
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
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-white/25 text-sm tracking-wide">
                  {search ? 'Sin resultados.' : 'No hay productos.'}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-white/30 hover:text-white text-[10px] tracking-[0.2em] uppercase transition-colors"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#0d0d0d] border border-white/10 overflow-hidden">
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                  <h2 className="text-white/35 text-[10px] tracking-[0.35em] uppercase font-medium">
                    Catálogo de productos
                  </h2>
                  {search && (
                    <span className="text-white/25 text-[10px] tracking-wide">
                      {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        {[
                          { label: 'Imagen',  cls: 'w-16' },
                          { label: 'Nombre',  cls: '' },
                          { label: 'Precio',  cls: 'hidden sm:table-cell' },
                          { label: 'Stock',   cls: 'hidden md:table-cell' },
                          { label: '',        cls: '' },
                        ].map(({ label, cls }) => (
                          <th
                            key={label}
                            className={`pb-3 px-4 first:px-6 last:px-6 text-[10px] tracking-[0.25em] uppercase text-white/25 font-medium ${cls}`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <ProductRow key={p.id} producto={p} onOpenModal={setModal} onDelete={setDeleteTarget} />
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