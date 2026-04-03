'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCarrito, selectTotal, selectCantidadTotal } from '@/lib/carrito';
import { useAuth } from '@/lib/auth';

const SHIPPING = 0;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtCOP(n) { return `$${Number(n).toLocaleString('es-CO')}`; }

function buildWompiUrl(wompiLink) { return wompiLink; }

/* ─── Cart item ──────────────────────────────────────────────────────────── */
function CartItem({ item }) {
  const { quitar, actualizarCantidad } = useCarrito();
  const imgSrc = item.imagen_url ?? item.imagen ?? null;

  return (
    <div className="flex gap-4 py-6 border-b border-white/10 last:border-0">
      <div className="shrink-0 w-20 bg-[#111] border border-white/10 overflow-hidden" style={{ height: 104 }}>
        {imgSrc ? (
          <img src={imgSrc} alt={item.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/10 text-xl font-black">JD</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-white text-sm font-medium tracking-wide leading-snug mb-1">{item.nombre}</h3>
            {item.talla && item.talla !== 'Única' && (
              <p className="text-white/30 text-xs tracking-widest uppercase">Talla: {item.talla}</p>
            )}
          </div>
          <button onClick={() => quitar(item.id, item.talla)}
            className="text-white/25 hover:text-white/60 transition-colors shrink-0 mt-0.5" aria-label="Eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-white/15">
            <button onClick={() => actualizarCantidad(item.id, item.talla, item.cantidad - 1)}
              className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors text-base">−</button>
            <span className="w-8 text-center text-white text-xs font-medium">{item.cantidad}</span>
            <button onClick={() => actualizarCantidad(item.id, item.talla, item.cantidad + 1)}
              className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors text-base">+</button>
          </div>
          <span className="text-white font-bold text-sm">{fmtCOP(item.precio * item.cantidad)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Order summary ──────────────────────────────────────────────────────── */
function OrderSummary({ subtotal, onCheckout }) {
  const total = subtotal + SHIPPING;
  return (
    <div className="bg-[#0d0d0d] border border-white/10 p-6 sticky top-24">
      <h2 className="text-white font-bold text-sm tracking-[0.2em] uppercase mb-6">Resumen del pedido</h2>
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Subtotal</span>
          <span className="text-white">{fmtCOP(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Envío</span>
          <span className="text-green-400 text-xs tracking-wide">Gratis</span>
        </div>
      </div>
      <div className="border-t border-white/10 pt-4 mb-6">
        <div className="flex justify-between">
          <span className="text-white font-bold text-sm tracking-wide uppercase">Total</span>
          <span className="text-white font-black text-xl">{fmtCOP(total)}</span>
        </div>
      </div>
      <button onClick={onCheckout}
        className="w-full py-4 bg-white text-black text-xs font-black tracking-[0.3em] uppercase hover:bg-white/90 transition-colors">
        Ir a método de pago
      </button>
      <p className="text-white/20 text-[10px] tracking-wide text-center mt-4">
        Elige cómo quieres pagar tu pedido.
      </p>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg className="text-white/10 mb-6" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <p className="text-white/30 text-sm tracking-wide mb-8">Tu carrito está vacío</p>
      <Link href="/productos"
        className="text-xs tracking-[0.3em] uppercase bg-white text-black font-bold px-8 py-3 hover:bg-white/90 transition-colors">
        Ir al catálogo
      </Link>
    </div>
  );
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

/* ─── Address form ───────────────────────────────────────────────────────── */
function AddressForm({ fields, onChange }) {
  const INPUT = 'w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide';
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Dirección *</label>
        <input type="text" value={fields.direccion} onChange={(e) => onChange('direccion', e.target.value)}
          placeholder="Calle 10 # 5-20" className={INPUT} />
      </div>
      <div>
        <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Barrio *</label>
        <input type="text" value={fields.barrio} onChange={(e) => onChange('barrio', e.target.value)}
          placeholder="El Poblado" className={INPUT} />
      </div>
      <div>
        <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-1.5">Celular *</label>
        <input type="tel" value={fields.celular} onChange={(e) => onChange('celular', e.target.value)}
          placeholder="300 123 4567" className={INPUT} />
      </div>
    </div>
  );
}

/* ─── Payment modal ──────────────────────────────────────────────────────── */
function MetodoPagoModal({ items, subtotal, token, onClose, onSuccess }) {
  // step: 'select' | 'wompi' | 'contraentrega'
  const [step,    setStep]    = useState('select');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);
  const [addr,    setAddr]    = useState({ direccion: '', barrio: '', celular: '' });

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, loading]);

  const setField = (k, v) => setAddr((p) => ({ ...p, [k]: v }));

  const pedidoItems = items.map((i) => ({
    producto_id: i.id,
    cantidad:    i.cantidad,
    talla:       i.talla ?? null,
  }));

  /* Separar */
  const handleSeparar = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        'http://localhost:8000/api/pedidos/separar',
        { items: pedidoItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('¡Pedido separado! Tienes 24 horas para pagar en tienda.');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Error al separar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  /* Wompi */
  const handleWompi = async () => {
    if (!addr.direccion.trim() || !addr.barrio.trim() || !addr.celular.trim()) {
      setError('Completa todos los campos para continuar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const pedidoRes = await axios.post(
        'http://localhost:8000/api/pedidos/',
        {
          items:     pedidoItems,
          direccion: addr.direccion.trim(),
          barrio:    addr.barrio.trim(),
          celular:   addr.celular.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const pedidoId = pedidoRes.data?.id;
      const pagoRes = await axios.post(
        `http://localhost:8000/api/pagos/iniciar/${pedidoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const wompiUrl =
        pagoRes.data?.url ||
        pagoRes.data?.wompi_url ||
        pagoRes.data?.redirect_url ||
        pagoRes.data?.link;
      onSuccess();
      window.location.href = wompiUrl;
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  /* Contraentrega */
  const handleContraentrega = async () => {
    if (!addr.direccion.trim() || !addr.barrio.trim() || !addr.celular.trim()) {
      setError('Completa todos los campos para continuar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        'http://localhost:8000/api/pedidos/',
        {
          items:  pedidoItems,
          notas:  `Contraentrega: ${addr.direccion.trim()}, ${addr.barrio.trim()}, cel: ${addr.celular.trim()}`,
          celular: addr.celular.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('¡Pedido confirmado! Te contactaremos para coordinar la entrega.');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Error al confirmar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  const METHODS = [
    {
      key:   'separar',
      title: 'Separar y pagar en tienda',
      desc:  'Reservamos tu pedido por 24 horas. Paga en nuestra tienda física.',
      icon:  (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      key:   'wompi',
      title: 'Pagar con Wompi',
      desc:  'Pago seguro con tarjeta, PSE o Nequi.',
      icon:  (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
    {
      key:   'contraentrega',
      title: 'Pagar contraentrega',
      desc:  'Paga cuando recibas tu pedido.',
      icon:  (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
  ];

  const stepTitles = {
    wompi:         'Pagar con Wompi',
    contraentrega: 'Pagar contraentrega',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-[#0d0d0d] border border-white/15 w-full max-w-md flex flex-col max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0d0d0d]">
          <div>
            <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase">Checkout</p>
            <p className="text-white text-sm font-bold tracking-wide mt-0.5">
              {step === 'select' ? 'Método de pago' : stepTitles[step]}
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="text-white/30 hover:text-white transition-colors p-1 disabled:opacity-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">

          {/* ── Success ── */}
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-white text-sm tracking-wide leading-relaxed">{success}</p>
              <button onClick={onClose}
                className="mt-2 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 px-6 py-2 transition-colors">
                Cerrar
              </button>
            </div>
          ) : step === 'select' ? (
            /* ── Method selection ── */
            <>
              <p className="text-white/40 text-xs tracking-wide">
                Total a pagar: <span className="text-white font-bold">{fmtCOP(subtotal)}</span>
              </p>
              {METHODS.map(({ key, title, desc, icon }) => (
                <button key={key} onClick={key === 'separar' ? handleSeparar : () => { setStep(key); setError(null); }}
                  disabled={loading}
                  className="flex items-start gap-4 p-4 border border-white/10 hover:border-white/30 hover:bg-white/[0.02] text-left transition-colors disabled:opacity-50 group">
                  <span className="text-white/40 group-hover:text-white/70 transition-colors mt-0.5 shrink-0">{icon}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold tracking-wide mb-1">{title}</p>
                    <p className="text-white/40 text-xs tracking-wide leading-relaxed">{desc}</p>
                  </div>
                  {loading && key === 'separar' ? (
                    <span className="text-white/40 mt-1 shrink-0"><Spinner /></span>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 group-hover:text-white/50 transition-colors mt-1 shrink-0">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              ))}
              {error && (
                <div className="px-4 py-3 text-xs border"
                  style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
                  {error}
                </div>
              )}
            </>
          ) : (
            /* ── Address form step ── */
            <>
              <p className="text-white/40 text-xs tracking-wide">
                Total: <span className="text-white font-bold">{fmtCOP(subtotal)}</span>
              </p>
              <AddressForm fields={addr} onChange={setField} />
              {error && (
                <div className="px-4 py-3 text-xs border"
                  style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)' }}>
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setStep('select'); setError(null); }} disabled={loading}
                  className="flex-1 text-white/40 hover:text-white text-[10px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-3 transition-colors disabled:opacity-40">
                  Volver
                </button>
                <button
                  onClick={step === 'wompi' ? handleWompi : handleContraentrega}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading && <Spinner />}
                  {loading ? 'Procesando...' : step === 'wompi' ? 'Ir a Wompi' : 'Confirmar pedido'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function CarritoPage() {
  const router   = useRouter();
  const items    = useCarrito((s) => s.items);
  const vaciar   = useCarrito((s) => s.vaciar);
  const subtotal = useCarrito(selectTotal);
  const { usuario, token } = useAuth();

  const [mounted,      setMounted]      = useState(false);
  const [pagoModal,    setPagoModal]    = useState(false);

  useEffect(() => setMounted(true), []);

  const handleCheckout = () => {
    if (!mounted || items.length === 0) return;
    if (!token || !usuario) { router.push('/login'); return; }
    setPagoModal(true);
  };

  const handlePaymentSuccess = () => {
    vaciar();
  };

  return (
    <>
      {pagoModal && mounted && (
        <MetodoPagoModal
          items={items}
          subtotal={subtotal}
          token={token}
          onClose={() => setPagoModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />

        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-2">Tu selección</p>
                <h1 className="text-white font-black text-4xl uppercase tracking-tight"
                  style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}>
                  Carrito
                </h1>
              </div>
              {mounted && items.length > 0 && (
                <button onClick={vaciar}
                  className="text-white/30 hover:text-white/60 text-xs tracking-[0.2em] uppercase transition-colors">
                  Vaciar carrito
                </button>
              )}
            </div>

            {!mounted ? null : items.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Items */}
                <div className="lg:col-span-2">
                  <p className="text-white/30 text-xs tracking-[0.2em] uppercase mb-4 pb-4 border-b border-white/10">
                    {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                  </p>
                  <div>
                    {items.map((item) => (
                      <CartItem key={`${item.id}-${item.talla}`} item={item} />
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link href="/productos"
                      className="text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase border-b border-white/20 hover:border-white/50 pb-0.5 transition-colors">
                      ← Seguir comprando
                    </Link>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <OrderSummary subtotal={subtotal} onCheckout={handleCheckout} />
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
