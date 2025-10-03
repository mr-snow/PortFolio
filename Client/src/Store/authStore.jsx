import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const authStore = create(
  persist(
    set => ({
      userId: '',
      token: '',
      setUserId: newId => set({ userId: newId }),
      setToken: newToken => set({ token: newToken }),
      removeUserId: () => set({ userId: '' }),
      removeToken: () => set({ token: '' }),
    }),
    { name: 'authStore' }
  )
);

export default authStore;
