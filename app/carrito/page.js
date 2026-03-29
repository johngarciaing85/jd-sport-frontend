'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCarrito, selectTotal, selectCantidadTotal } from '@/lib/carrito';

const WOMPI_KEY = process.env.NEXT_PUBLIC_WOMPI_KEY ?? 'pub_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const SHIPPING = 0; // free shipping

function buildWompiUrl(total) {
  const reference = `JD-${Date.now()}`;
  const amountCents = Math.round(total * 100);
  const params = new URLSearchParams({
    'public-key': WOMPI_KEY,
    currency: 'COP',
    'amount-in-cents': String(amountCents),
    reference,
    'redirect-url': `${typeof window !== 'undefined' ? window.location.origin : ''}/mis-pedidos`,
  });
  return `https://checkout.wompi.co/p/?${params.toString()}`;
}

/* ─── Item row ───────────────────────────────────────────────────────────── */
function CartItem({ item }) {
  const { quitar, actualizarCantidad } = useCarrito();

  return (
    <div className="flex gap-4 py-6 border-b border-white/10 last:border-0">
      {/* Image */}
      <div className="shrink-0 w-20 h-26 bg-[#111] border border-white/10 overflow-hidden"
        style={{ height: '104px' }}>
        {item.imagen ? (
          <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/10 text-xl font-black">JD</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-white text-sm font-medium tracking-wide leading-snug mb-1">
              {item.nombre}
            </h3>
            {item.talla && item.talla !== 'Única' && (
              <p className="text-white/30 text-xs tracking-widest uppercase">
                Talla: {item.talla}
              </p>
            )}
          </div>
          <button
            onClick={() => quitar(item.id, item.talla)}
            className="text-white/25 hover:text-white/60 transition-colors shrink-0 mt-0.5"
            aria-label="Eliminar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity */}
          <div className="flex items-center border border-white/15">
            <button
              onClick={() => actualizarCantidad(item.id, item.talla, item.cantidad - 1)}
              className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors text-base"
            >
              −
            </button>
            <span className="w-8 text-center text-white text-xs font-medium">{item.cantidad}</span>
            <button
              onClick={() => actualizarCantidad(item.id, item.talla, item.cantidad + 1)}
              className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors text-base"
            >
              +
            </button>
          </div>

          {/* Subtotal */}
          <span className="text-white font-bold text-sm">
            ${(item.precio * item.cantidad).toLocaleString('es-CO')}
          </span>
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
      <h2 className="text-white font-bold text-sm tracking-[0.2em] uppercase mb-6">
        Resumen del pedido
      </h2>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Subtotal</span>
          <span className="text-white">${subtotal.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Envío</span>
          <span className="text-green-400 text-xs tracking-wide">Gratis</span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4 mb-6">
        <div className="flex justify-between">
          <span className="text-white font-bold text-sm tracking-wide uppercase">Total</span>
          <span className="text-white font-black text-xl">
            ${total.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full py-4 bg-white text-black text-xs font-black tracking-[0.3em] uppercase hover:bg-white/90 transition-colors"
      >
        Pagar con Wompi
      </button>

      <p className="text-white/20 text-[10px] tracking-wide text-center mt-4">
        Serás redirigido a Wompi para completar el pago de forma segura.
      </p>

      <div className="flex justify-center gap-3 mt-4 opacity-30">
        {['Visa', 'MC', 'PSE', 'Nequi'].map((m) => (
          <span key={m} className="text-white text-[9px] tracking-widest uppercase border border-white/20 px-1.5 py-0.5">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg
        className="text-white/10 mb-6"
        width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <p className="text-white/30 text-sm tracking-wide mb-8">Tu carrito está vacío</p>
      <Link
        href="/productos"
        className="text-xs tracking-[0.3em] uppercase bg-white text-black font-bold px-8 py-3 hover:bg-white/90 transition-colors"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function CarritoPage() {
  const items = useCarrito((s) => s.items);
  const vaciar = useCarrito((s) => s.vaciar);
  const subtotal = useCarrito(selectTotal);

  // Avoid hydration mismatch with persisted store
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleCheckout = () => {
    if (!mounted || items.length === 0) return;
    window.location.href = buildWompiUrl(subtotal);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-2">Tu selección</p>
              <h1
                className="text-white font-black text-4xl uppercase tracking-tight"
                style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
              >
                Carrito
              </h1>
            </div>
            {mounted && items.length > 0 && (
              <button
                onClick={vaciar}
                className="text-white/30 hover:text-white/60 text-xs tracking-[0.2em] uppercase transition-colors"
              >
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
                  <Link
                    href="/productos"
                    className="text-white/40 hover:text-white text-xs tracking-[0.2em] uppercase border-b border-white/20 hover:border-white/50 pb-0.5 transition-colors"
                  >
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
  );
}
