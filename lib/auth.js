import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = 'http://localhost:8000/api';

function applyToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

/**
 * Auth store — persisted to localStorage as 'jd-auth'.
 * Re-applies the Authorization header on rehydration so all
 * subsequent axios calls are authenticated automatically.
 */
export const useAuth = create(
  persist(
    (set, get) => ({
      usuario: null, // { id, nombre, apellido, email, ... }
      token: null,

      /** Login: calls API, stores token + user, sets axios header. */
      async login(email, password) {
        const res = await axios.post(`${API}/auth/login/`, { email, password });
        // Support both { token, user } and { access, user } response shapes
        const token = res.data.token ?? res.data.access;
        const usuario = res.data.user ?? res.data.usuario ?? null;
        applyToken(token);
        set({ token, usuario });
        return res.data;
      },

      /** Register: creates account and auto-logs in if API returns token. */
      async registro(datos) {
        const res = await axios.post(`${API}/auth/registro/`, datos);
        const token = res.data.token ?? res.data.access ?? null;
        const usuario = res.data.user ?? res.data.usuario ?? null;
        if (token) {
          applyToken(token);
          set({ token, usuario });
        }
        return res.data;
      },

      /** Logout: clears store and axios header. */
      logout() {
        applyToken(null);
        set({ usuario: null, token: null });
      },

      /** Manually set auth (e.g. after token refresh). */
      setAuth(usuario, token) {
        applyToken(token);
        set({ usuario, token });
      },

      isAuthenticated() {
        return !!get().token;
      },
    }),
    {
      name: 'jd-auth',
      // Re-apply axios header after localStorage rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.token) applyToken(state.token);
      },
    }
  )
);
