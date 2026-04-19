'use client';
import { API_URL } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/auth';
import ProductoForm from '../_form';

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

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function NuevoProducto() {
  const router  = useRouter();
  const { usuario, token } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token)          { router.replace('/login'); return; }
    if (!isAdmin(usuario)) { router.replace('/');     return; }
  }, [mounted, token, usuario, router]);

  const handleSubmit = async (fields, imageFile, tallasStock = []) => {
    setSaving(true);
    setError(null);
    try {
      const payload = { ...fields };
      if (!payload.precio_oferta) delete payload.precio_oferta;
      if (!payload.categoria_id)  delete payload.categoria_id;
      payload.precio = Number(payload.precio) || 0;
      payload.stock  = Number(payload.stock)  || 0;
      if (payload.precio_oferta !== undefined) payload.precio_oferta = Number(payload.precio_oferta) || 0;

      const res = await axios.post(`${API_URL}/productos/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const id = res.data?.id;

      // Save tallas stock
      if (id && tallasStock.length > 0) {
        await axios.post(
          `${API_URL}/productos/${id}/tallas`,
          { tallas: tallasStock },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (imageFile && id) {
        const form = new FormData();
        form.append('imagen', imageFile);
        await axios.post(`${API_URL}/productos/${id}/imagen`, form, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      }

      router.push('/admin/productos');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail)
        ? detail.map(e => e.msg).join(', ')
        : (typeof detail === 'string' ? detail : (err.response?.data?.message || 'Error al crear el producto. Verifica los datos.'));
      setError(errorMsg);
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
                Nuevo Producto
              </h1>
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

          {/* ── Form ── */}
          <div className="bg-[#0d0d0d] border border-white/10 p-6 sm:p-8">
            <ProductoForm
              token={token}
              onSubmit={handleSubmit}
              saving={saving}
              error={error}
              submitLabel="Crear producto"
            />
          </div>

        </div>
      </main>
    </div>
  );
}