import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
function applyToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

export const useAuth = create(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      // Not persisted — always starts false, set to true by onRehydrateStorage
      _hasHydrated: false,

      async login(email, password) {
        const res = await axios.post(`${API}/usuarios/login`, { email, password });
        console.log('[Auth] login response:', res.data);
        const token = res.data.access_token;
        const usuario = res.data.usuario;
        console.log('[Auth] usuario stored:', usuario);
        applyToken(token);
        set({ token, usuario });
        return res.data;
      },

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

      logout() {
        applyToken(null);
        set({ usuario: null, token: null });
      },

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
      // Explicit lazy storage accessor — required for Next.js App Router
      // to avoid accessing localStorage during SSR
      storage: createJSONStorage(() => localStorage),
      // Only persist auth data; _hasHydrated must always start as false
      partialize: (state) => ({ usuario: state.usuario, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) applyToken(state.token);
        useAuth.setState({ _hasHydrated: true });
      },
    }
  )
);