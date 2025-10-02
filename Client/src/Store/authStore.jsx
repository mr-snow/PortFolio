import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const authStore = create(
  persist(
    set => ({
      userId: '',
      setUserId: newId => set({ userId: newId }),
      removeUserId: () => set({ userId: '' }),
    }),
    { name: 'authStore' }
  )
);

export default authStore;
