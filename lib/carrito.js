import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart store — persisted to localStorage as 'jd-carrito'.
 * Each item: { id, nombre, precio, imagen, talla, cantidad }
 */
export const useCarrito = create(
  persist(
    (set, get) => ({
      items: [],

      /** Add product to cart. Increments cantidad if same id+talla already exists. */
      agregar(producto, talla, cantidad = 1) {
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.id === producto.id && i.talla === talla
          );
          if (idx !== -1) {
            const items = [...state.items];
            items[idx] = { ...items[idx], cantidad: items[idx].cantidad + cantidad };
            return { items };
          }
          return {
            items: [
              ...state.items,
              {
                id: producto.id,
                nombre: producto.nombre,
                precio: Number(producto.precio),
                imagen: producto.imagen ?? null,
                talla,
                cantidad,
              },
            ],
          };
        });
      },

      /** Remove one item (matched by id + talla). */
      quitar(id, talla) {
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.talla === talla)),
        }));
      },

      /** Set a specific quantity for an item. Removes it if cantidad < 1. */
      actualizarCantidad(id, talla, cantidad) {
        if (cantidad < 1) {
          get().quitar(id, talla);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.talla === talla ? { ...i, cantidad } : i
          ),
        }));
      },

      /** Empty the cart. */
      vaciar() {
        set({ items: [] });
      },
    }),
    { name: 'jd-carrito' }
  )
);

/* ─── Selectors (use outside the store for clean components) ── */
export const selectTotal = (state) =>
  state.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

export const selectCantidadTotal = (state) =>
  state.items.reduce((acc, i) => acc + i.cantidad, 0);
