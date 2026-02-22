type Listener = () => void;

const listeners = new Set<Listener>();

let lock = false;
let lockTimer: ReturnType<typeof setTimeout> | null = null;

export const authEvents = {
  onUnauthorized(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  emitUnauthorized(): void {
    // Evita storms de 401 → solo dispara una vez por ventana
    if (lock) return;

    lock = true;
    listeners.forEach((l) => l());

    // libera lock después de 1.5s (ajustable)
    if (lockTimer) clearTimeout(lockTimer);
    lockTimer = setTimeout(() => {
      lock = false;
      lockTimer = null;
    }, 1500);
  },

  // opcional: si quieres liberar manualmente en login success
  resetUnauthorizedLock(): void {
    lock = false;
    if (lockTimer) clearTimeout(lockTimer);
    lockTimer = null;
  },
};
