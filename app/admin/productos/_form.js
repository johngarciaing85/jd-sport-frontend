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
    talla:         '',
    color:         '',
    genero:        'unisex',
    categoria_id:  '',
    destacado:     false,
    activo:        true,
    ...initialData,
  });

  const [customTalla,  setCustomTalla]  = useState('');
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
    onSubmit(fields, imageFile);
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
        <Field label="Stock *">
          <input
            required
            type="number"
            min="0"
            step="1"
            value={fields.stock}
            onChange={(e) => set('stock', e.target.value)}
            placeholder="0"
            className={INPUT}
          />
        </Field>
      </div>

      {/* ── Talla chips ── */}
      <div>
        <label className="block text-white/30 text-[10px] tracking-[0.25em] uppercase mb-3">Tallas disponibles</label>
        <div className="flex flex-wrap gap-2">
          {TALLAS_OPCIONES.map((t) => {
            const selected = fields.talla.split(',').map((s) => s.trim()).filter(Boolean).includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  const current = fields.talla.split(',').map((s) => s.trim()).filter(Boolean);
                  const next = selected ? current.filter((s) => s !== t) : [...current, t];
                  set('talla', next.join(','));
                }}
                className={`min-w-[44px] h-9 px-3 border text-xs font-medium tracking-wide transition-all ${
                  selected
                    ? 'bg-white text-black border-white'
                    : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        {/* Custom tallas (not in predefined list) shown as removable chips */}
        {fields.talla.split(',').map((s) => s.trim()).filter((s) => s && !TALLAS_OPCIONES.includes(s)).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              const next = fields.talla.split(',').map((s) => s.trim()).filter((s) => s && s !== t);
              set('talla', next.join(','));
            }}
            className="flex items-center gap-1.5 min-w-[44px] h-9 px-3 border text-xs font-medium tracking-wide transition-all bg-white text-black border-white"
          >
            {t}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ))}
      </div>

      {/* Custom talla input */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={customTalla}
          onChange={(e) => setCustomTalla(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const val = customTalla.trim();
            if (!val) return;
            const current = fields.talla.split(',').map((s) => s.trim()).filter(Boolean);
            if (!current.includes(val)) set('talla', [...current, val].join(','));
            setCustomTalla('');
          }}
          placeholder="Ej. 28, 30, 32..."
          className="flex-1 bg-[#111] border border-white/15 text-white text-sm px-4 py-2 placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors tracking-wide"
        />
        <button
          type="button"
          onClick={() => {
            const val = customTalla.trim();
            if (!val) return;
            const current = fields.talla.split(',').map((s) => s.trim()).filter(Boolean);
            if (!current.includes(val)) set('talla', [...current, val].join(','));
            setCustomTalla('');
          }}
          className="px-4 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/50 text-xs tracking-[0.2em] uppercase transition-colors shrink-0"
        >
          Agregar
        </button>
      </div>

      {fields.talla && (
        <p className="text-white/25 text-[10px] tracking-wide mt-2">Seleccionadas: {fields.talla}</p>
      )}

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
