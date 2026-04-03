'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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

      {/* ── Details ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Talla">
          <input
            type="text"
            value={fields.talla}
            onChange={(e) => set('talla', e.target.value)}
            placeholder="M, L, XL"
            className={INPUT}
          />
        </Field>
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
