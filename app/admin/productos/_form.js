'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TALLAS_OPCIONES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '6', '7', '8', '9', '10', '11', '12', 'UNICA'];

const INPUT =
  'w-full bg-[#111] border border-white/15 text-white text-sm px-4 py-2.5 ' +
  'placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── TallasStockEditor ──────────────────────────────────────────────────── */
function TallasStockEditor({ tallasStock, onChange }) {
  const [customInput, setCustomInput] = useState('');

  // tallasStock: [{talla: "M", stock: 5}, ...]
  const names = tallasStock.map((t) => t.talla);

  const addTalla = (nombre) => {
    const n = nombre.trim().toUpperCase();
    if (!n || names.includes(n)) return;
    onChange([...tallasStock, { talla: n, stock: 0 }]);
  };

  const removeTalla = (nombre) => {
    onChange(tallasStock.filter((t) => t.talla !== nombre));
  };

  const setStock = (nombre, stock) => {
    onChange(tallasStock.map((t) => t.talla === nombre ? { ...t, stock: Math.max(0, Number(stock) || 0) } : t));
  };

  const togglePredefined = (nombre) => {
    if (names.includes(nombre)) removeTalla(nombre);
    else addTalla(nombre);
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase">
        Tallas y stock por talla
      </label>

      {/* Predefined chips */}
      <div className="flex flex-wrap gap-2">
        {TALLAS_OPCIONES.map((t) => {
          const active = names.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => togglePredefined(t)}
              className={`min-w-[44px] h-9 px-3 border text-xs font-medium tracking-wide transition-all ${
                active
                  ? 'bg-white text-black border-white'
                  : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Custom talla add */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            addTalla(customInput);
            setCustomInput('');
          }}
          placeholder="Talla personalizada (ej. 28, 30)..."
          className="flex-1 bg-[#111] border border-white/15 text-white text-sm px-4 py-2 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide"
        />
        <button
          type="button"
          onClick={() => { addTalla(customInput); setCustomInput(''); }}
          className="px-4 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/50 text-xs tracking-[0.2em] uppercase transition-colors shrink-0"
        >
          Agregar
        </button>
      </div>

      {/* Stock rows */}
      {tallasStock.length > 0 && (
        <div className="border border-white/10 divide-y divide-white/[0.06]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_32px] gap-3 px-4 py-2">
            <span className="text-white/25 text-[10px] tracking-[0.25em] uppercase">Talla</span>
            <span className="text-white/25 text-[10px] tracking-[0.25em] uppercase">Stock</span>
            <span />
          </div>
          {tallasStock.map(({ talla, stock }) => (
            <div key={talla} className="grid grid-cols-[1fr_120px_32px] gap-3 items-center px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium tracking-wide">{talla}</span>
                {stock === 0 && (
                  <span className="text-[9px] tracking-wide border px-1.5 py-0.5"
                    style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.06)' }}>
                    Agotado
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(talla, e.target.value)}
                className="w-full bg-[#111] border border-white/15 text-white text-sm px-3 py-1.5 focus:outline-none focus:border-white/40 transition-colors text-center"
              />
              <button
                type="button"
                onClick={() => removeTalla(talla)}
                className="flex items-center justify-center text-white/20 hover:text-red-400 transition-colors"
                aria-label={`Eliminar talla ${talla}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          ))}
          {/* Total stock summary */}
          <div className="grid grid-cols-[1fr_120px_32px] gap-3 items-center px-4 py-2 bg-white/[0.02]">
            <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Total stock</span>
            <span className="text-white/60 text-sm font-bold text-center">
              {tallasStock.reduce((acc, t) => acc + t.stock, 0)}
            </span>
            <span />
          </div>
        </div>
      )}

      {tallasStock.length === 0 && (
        <p className="text-white/20 text-xs tracking-wide">
          Selecciona tallas arriba o agrega una personalizada.
        </p>
      )}
    </div>
  );
}

/* ─── GaleriaImagenes ────────────────────────────────────────────────────── */
function GaleriaImagenes({ productoId, initialImagenes = [], token }) {
  const [imagenes, setImagenes] = useState(() =>
    Array.isArray(initialImagenes) ? initialImagenes : []
  );
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleAdd = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append('imagenes', f));
      const res = await axios.post(
        `http://localhost:8000/api/productos/${productoId}/imagenes`,
        form,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      const nuevas = Array.isArray(res.data)
        ? res.data
        : (res.data?.imagenes ?? []);
      setImagenes((prev) => [...prev, ...nuevas]);
    } catch (err) {
      console.error('[Galería] upload error', err.response?.status, err.response?.data);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (img) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/productos/${productoId}/imagenes/${img.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setImagenes((prev) => prev.filter((i) => i.id !== img.id));
    } catch (err) {
      console.error('[Galería] delete error', err.response?.status, err.response?.data);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Galería de imágenes</p>
      <div className="flex flex-wrap gap-3">
        {imagenes.map((img) => {
          const src = img.url ?? img.imagen_url ?? img.imagen ?? null;
          return (
            <div key={img.id} className="relative shrink-0 group/thumb" style={{ width: 80, height: 107 }}>
              {src && (
                <img src={src} alt="" className="w-full h-full object-cover border border-white/10" />
              )}
              <button
                type="button"
                onClick={() => handleDelete(img)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/80 border border-white/20 opacity-0 group-hover/thumb:opacity-100 hover:bg-red-600 hover:border-red-600 transition-all"
                aria-label="Eliminar imagen"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add tile */}
        <label
          className={`shrink-0 flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-white/50 transition-colors ${uploading ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`}
          style={{ width: 80, height: 107 }}
        >
          {uploading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-white/30">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-white/25 text-[9px] tracking-[0.15em] uppercase mt-1.5">Agregar</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={handleAdd}
          />
        </label>
      </div>
      <p className="text-white/20 text-[9px] tracking-wide">JPG · PNG · WEBP · Múltiples archivos</p>
    </div>
  );
}

/* ─── ProductoForm ───────────────────────────────────────────────────────── */
export default function ProductoForm({
  initialData = {},
  token,
  onSubmit,
  saving,
  error,
  submitLabel = 'Guardar',
}) {
  const fileRef = useRef(null);

  const [fields, setFields] = useState({
    nombre:        '',
    descripcion:   '',
    precio:        '',
    precio_oferta: '',
    stock:         '',
    color:         '',
    genero:        'unisex',
    categoria_id:  '',
    destacado:     false,
    activo:        true,
    ...initialData,
  });

  // Initialise tallasStock from initialData.tallas_stock or empty
  const [tallasStock, setTallasStock] = useState(() => {
    if (Array.isArray(initialData.tallas_stock) && initialData.tallas_stock.length > 0) {
      return initialData.tallas_stock.map(({ talla, stock }) => ({ talla, stock }));
    }
    return [];
  });

  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData.imagen || initialData.imagen_url || null
  );
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    if (!token) return;
    axios
      .get('http://localhost:8000/api/categorias/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list =
          res.data?.items ?? res.data?.results ?? (Array.isArray(res.data) ? res.data : []);
        setCategorias(list);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const set = (key, val) => setFields((prev) => ({ ...prev, [key]: val }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(fields, imageFile, tallasStock);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">

      {/* ── Image + name/description ── */}
      <div className="flex flex-col sm:flex-row gap-6">

        {/* Image picker */}
        <div className="shrink-0 flex flex-col gap-3 items-start">
          <p className="text-white/30 text-[10px] tracking-[0.25em] uppercase">Imagen</p>
          <div
            className="bg-[#111] border border-white/10 overflow-hidden cursor-pointer hover:border-white/25 transition-colors"
            style={{ width: 160, height: 213 }}
            onClick={() => fileRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <svg
                  width="24" height="24" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.2"
                  className="text-white/20"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase">Clic para subir</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-white/35 hover:text-white text-[10px] tracking-[0.2em] uppercase border border-white/10 hover:border-white/30 px-3 py-1.5 transition-colors"
          >
            {imageFile
              ? (imageFile.name.length > 18 ? imageFile.name.slice(0, 18) + '…' : imageFile.name)
              : 'Seleccionar'}
          </button>
          <p className="text-white/20 text-[9px] tracking-wide">JPG · PNG · WEBP</p>
        </div>

        {/* Name + description */}
        <div className="flex-1 flex flex-col gap-4">
          <Field label="Nombre *">
            <input
              required
              type="text"
              value={fields.nombre}
              onChange={(e) => set('nombre', e.target.value)}
              placeholder="Ej. Nike Air Force 1"
              className={INPUT}
            />
          </Field>
          <Field label="Descripción">
            <textarea
              value={fields.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              rows={5}
              placeholder="Descripción del producto…"
              className={INPUT + ' resize-none'}
            />
          </Field>
        </div>
      </div>

      {/* ── Prices + stock ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Precio (COP) *">
          <input
            required
            type="number"
            min="0"
            step="1"
            value={fields.precio}
            onChange={(e) => set('precio', e.target.value)}
            placeholder="0"
            className={INPUT}
          />
        </Field>
        <Field label="Precio oferta">
          <input
            type="number"
            min="0"
            step="1"
            value={fields.precio_oferta}
            onChange={(e) => set('precio_oferta', e.target.value)}
            placeholder="0"
            className={INPUT}
          />
        </Field>
      </div>

      {/* ── Tallas con stock ── */}
      <TallasStockEditor tallasStock={tallasStock} onChange={setTallasStock} />

      {/* ── Details ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Color">
          <input
            type="text"
            value={fields.color}
            onChange={(e) => set('color', e.target.value)}
            placeholder="Negro"
            className={INPUT}
          />
        </Field>
        <Field label="Género *">
          <select
            value={fields.genero}
            onChange={(e) => set('genero', e.target.value)}
            className={INPUT + ' appearance-none cursor-pointer'}
          >
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="unisex">Unisex</option>
          </select>
        </Field>
        <Field label="Categoría">
          <select
            value={fields.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
            className={INPUT + ' appearance-none cursor-pointer'}
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── Checkboxes ── */}
      <div className="flex items-center gap-8">
        {[
          { key: 'destacado', label: 'Destacado' },
          { key: 'activo',    label: 'Activo'     },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => set(key, !fields[key])}
              className={`w-4 h-4 border transition-colors flex items-center justify-center shrink-0 ${
                fields[key]
                  ? 'bg-white border-white'
                  : 'bg-transparent border-white/25 group-hover:border-white/50'
              }`}
            >
              {fields[key] && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase group-hover:text-white/70 transition-colors">
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* ── Galería (solo en edición) ── */}
      {initialData.id && (
        <GaleriaImagenes
          productoId={initialData.id}
          initialImagenes={initialData.imagenes}
          token={token}
        />
      )}

      {/* ── Error ── */}
      {error && (
        <div
          className="px-4 py-3 text-xs tracking-wide border"
          style={{
            color: '#f87171',
            borderColor: 'rgba(248,113,113,0.25)',
            background: 'rgba(248,113,113,0.07)',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Submit ── */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-white text-black text-[10px] font-bold tracking-[0.25em] uppercase px-10 py-3 hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg
                width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                className="animate-spin"
              >
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Guardando…
            </>
          ) : submitLabel}
        </button>
      </div>

    </form>
  );
}
