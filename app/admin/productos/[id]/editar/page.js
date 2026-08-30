'use client';
import { API_URL, safeErrorMessage } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth';
import ProductoForm from '../../_form';

function isAdmin(u) {
  return (
    u?.rol === 'admin' ||
    u?.role === 'admin' ||
    u?.is_admin === true ||
    u?.is_staff === true ||
    u?.es_admin === true
  );
}

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
        <Link
          key={href}
          href={href}
          className={`text-[10px] tracking-[0.25em] uppercase border px-4 py-2 transition-colors ${
            active === href
              ? 'text-white border-white/25 bg-white/5'
              : 'text-white/40 hover:text-white border-white/10 hover:border-white/30'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function FormSkeleton() {
  return (
    <div className="bg-[#0d0d0d] border border-white/10 p-6 sm:p-8 animate-pulse">
      <div className="flex gap-6 mb-7">
        <div className="w-40 h-52 bg-white/5 shrink-0" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-10 bg-white/5" />
          <div className="h-28 bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[0,1,2].map(i => <div key={i} className="h-10 bg-white/5" />)}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="h-10 bg-white/5" />)}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function EditarProducto() {
  const router       = useRouter();
  const { id }       = useParams();
  const { usuario, token } = useAuth();

  const [mounted,     setMounted]     = useState(false);
  const [producto,    setProducto]    = useState(null);
  const [loadError,   setLoadError]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token)           { router.replace('/login'); return; }
    if (!isAdmin(usuario)) { router.replace('/');     return; }

    axios
      .get(`${API_URL}/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const p = res.data;
        // Normalise nested categoria → categoria_id
        setProducto({
          ...p,
          categoria_id: p.categoria_id ?? p.categoria?.id ?? '',
          precio:        p.precio        ?? '',
          precio_oferta: p.precio_oferta ?? '',
          stock:         p.stock         ?? '',
          talla:         p.talla         ?? '',
          color:         p.color         ?? '',
          genero:        p.genero        ?? 'unisex',
          destacado:     p.destacado     ?? false,
          activo:        p.activo        ?? true,
        });
      })
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.replace('/login');
        } else {
          setLoadError('No se pudo cargar el producto.');
        }
      });
  }, [mounted, token, usuario, router, id]);

  const handleSubmit = async (fields, imageFile, tallasStock = []) => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        nombre:      fields.nombre,
        descripcion: fields.descripcion,
        precio:      Number(fields.precio) || 0,
        color:       fields.color      ?? '',
        genero:      fields.genero     ?? 'unisex',
        destacado:   Boolean(fields.destacado),
        activo:      Boolean(fields.activo),
      };
      if (fields.categoria_id) payload.categoria_id = Number(fields.categoria_id);
      if (fields.precio_oferta) payload.precio_oferta = Number(fields.precio_oferta) || 0;

      const res = await axios.put(`${API_URL}/productos/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Always sync tallas stock (empty array clears nothing, upserts when provided)
      if (tallasStock.length > 0) {
        await axios.post(
          `${API_URL}/productos/${id}/tallas`,
          { tallas: tallasStock },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (imageFile) {
        const form = new FormData();
        form.append('imagen', imageFile);
        await axios.post(`${API_URL}/productos/${id}/imagen`, form, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      }

      // Hard redirect garantiza datos frescos sin depender del caché del router
      window.location.href = '/admin/productos';
    } catch (err) {
      setSaveError(safeErrorMessage(err, 'No se pudo guardar el producto.'));
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-6 py-10">

          <AdminNav active="/admin/productos" />

          {/* ── Page header ── */}
          <div className="flex items-end justify-between gap-4 mb-10 pb-8 border-b border-white/10">
            <div>
              <p className="text-white/25 text-[10px] tracking-[0.4em] uppercase mb-2">
                Panel de administración
              </p>
              <h1
                className="text-white font-black text-4xl uppercase tracking-tight"
                style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
              >
                Editar Producto
              </h1>
              {producto && (
                <p className="text-white/30 text-xs mt-2 tracking-wide">{producto.nombre}</p>
              )}
            </div>
            <Link
              href="/admin/productos"
              className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:border-white/30 px-4 py-2 transition-colors shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Volver
            </Link>
          </div>

          {/* ── Load error ── */}
          {loadError && (
            <div
              className="border px-5 py-4 mb-8 text-sm"
              style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}
            >
              {loadError}
            </div>
          )}

          {/* ── Form ── */}
          {!loadError && (
            producto ? (
              <div className="bg-[#0d0d0d] border border-white/10 p-6 sm:p-8">
                <ProductoForm
                  key={producto.id}
                  initialData={producto}
                  token={token}
                  onSubmit={handleSubmit}
                  saving={saving}
                  error={saveError}
                  submitLabel="Guardar cambios"
                />
              </div>
            ) : !loadError && (
              <FormSkeleton />
            )
          )}

        </div>
      </main>
    </div>
  );
}