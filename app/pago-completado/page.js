'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const STATUS_CFG = {
  APPROVED: {
    label: 'Pago aprobado',
    description: 'Tu pago fue procesado exitosamente. Recibirás un correo con los detalles de tu pedido.',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.25)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  DECLINED: {
    label: 'Pago rechazado',
    description: 'Tu pago no pudo ser procesado. Verifica los datos de tu método de pago e intenta nuevamente.',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.25)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  VOIDED: {
    label: 'Pago anulado',
    description: 'La transacción fue anulada. No se realizó ningún cobro.',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.25)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
  ERROR: {
    label: 'Error en el pago',
    description: 'Ocurrió un error al procesar tu pago. Si el problema persiste, contáctanos.',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.25)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

const PENDING_CFG = {
  label: 'Pago pendiente',
  description: 'Tu pago está siendo procesado. Esto puede tardar unos minutos. Recibirás un correo cuando se confirme.',
  color: '#facc15',
  bg: 'rgba(250,204,21,0.08)',
  border: 'rgba(250,204,21,0.25)',
  icon: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

function statusCfg(status) {
  return STATUS_CFG[status] ?? PENDING_CFG;
}

function PagoContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    if (!transactionId) {
      setError('No se encontró el ID de la transacción.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchStatus() {
      const env = searchParams.get('env');
      const base = env === 'test'
        ? 'https://sandbox.wompi.co/v1'
        : 'https://production.wompi.co/v1';

      try {
        const res = await fetch(`${base}/transactions/${transactionId}`);
        if (!res.ok) throw new Error('No se pudo consultar la transacción.');
        const json = await res.json();
        if (!cancelled) setTransaction(json.data);
      } catch {
        if (!cancelled) setError('No pudimos verificar el estado de tu pago. Revisa tu correo o contacta soporte.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStatus();
    return () => { cancelled = true; };
  }, [transactionId, searchParams]);

  const cfg = transaction ? statusCfg(transaction.status) : null;
  const reference = transaction?.reference;
  const amountCents = transaction?.amount_in_cents;
  const method = transaction?.payment_method_type;

  const METHOD_LABELS = { CARD: 'Tarjeta', NEQUI: 'Nequi', PSE: 'PSE', BANCOLOMBIA_TRANSFER: 'Bancolombia' };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">

          <div className="mb-10">
            <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-3">Transacción</p>
            <h1
              className="text-white font-black text-3xl uppercase tracking-tight"
              style={{ fontFamily: "'Geist Sans', 'Arial Black', sans-serif" }}
            >
              Estado del<br />pago
            </h1>
          </div>

          {loading && (
            <div className="border border-white/10 bg-[#0a0a0a] px-6 py-10 flex flex-col items-center gap-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="animate-spin opacity-40">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <p className="text-white/40 text-xs tracking-wide">Consultando estado del pago...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col gap-6">
              <div className="border border-red-500/20 bg-red-500/5 px-5 py-6 flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-white/60 text-sm leading-relaxed tracking-wide">{error}</p>
              </div>
              <Link
                href="/"
                className="w-full block text-center bg-white text-black text-xs font-bold tracking-[0.3em] uppercase py-4 hover:bg-white/90 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          )}

          {transaction && !loading && (
            <div className="flex flex-col gap-6">
              {/* Status card */}
              <div className="border px-6 py-6 flex items-start gap-5"
                style={{ borderColor: cfg.border, background: cfg.bg }}>
                <div className="shrink-0 mt-0.5">{cfg.icon}</div>
                <div>
                  <p className="text-sm font-bold tracking-wide mb-1" style={{ color: cfg.color }}>
                    {cfg.label}
                  </p>
                  <p className="text-white/50 text-xs leading-relaxed tracking-wide">
                    {cfg.description}
                  </p>
                </div>
              </div>

              {/* Transaction details */}
              <div className="border border-white/10 bg-[#0a0a0a] divide-y divide-white/5">
                {reference && (
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Referencia</p>
                    <p className="text-white text-sm font-medium">#{reference}</p>
                  </div>
                )}
                {amountCents != null && (
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Total</p>
                    <p className="text-white text-sm font-bold">{COP.format(amountCents / 100)}</p>
                  </div>
                )}
                {method && (
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Método</p>
                    <p className="text-white text-sm">{METHOD_LABELS[method] ?? method}</p>
                  </div>
                )}
                <div className="flex items-center justify-between px-5 py-3.5">
                  <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Transacción</p>
                  <p className="text-white/50 text-xs font-mono">{transactionId}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/mis-pedidos"
                  className="w-full block text-center bg-white text-black text-xs font-bold tracking-[0.3em] uppercase py-4 hover:bg-white/90 transition-colors"
                >
                  Ver mis pedidos
                </Link>
                <Link
                  href="/"
                  className="w-full block text-center text-white/30 hover:text-white/60 text-xs tracking-[0.25em] uppercase border border-white/10 hover:border-white/30 py-4 transition-colors"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PagoCompletadoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <PagoContent />
    </Suspense>
  );
}
