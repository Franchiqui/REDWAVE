import { useCallback, useSyncExternalStore } from "react";

const isServer = typeof window === "undefined";

function getItem(key: string): string | null {
  if (isServer) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (isServer) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function removeItem(key: string): void {
  if (isServer) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function subscribe(key: string, callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === key) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getServerSnapshot(): string | null {
  return null;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const resolveInit = useCallback((): T => {
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  }, [initialValue]);

  const getSnapshot = useCallback((): string | null => {
    return getItem(key);
  }, [key]);

  const stored = useSyncExternalStore(
    useCallback((onStoreChange) => subscribe(key, onStoreChange), [key]),
    getSnapshot,
    getServerSnapshot
  );

  const value: T =
    stored === null
      ? resolveInit()
      : (() => {
          try {
            return JSON.parse(stored) as T;
          } catch {
            return resolveInit();
          }
        })();

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      if (isServer) return;
      const raw = getItem(key);
      const current: T =
        raw === null
          ? resolveInit()
          : (() => {
              try {
                return JSON.parse(raw) as T;
              } catch {
                return resolveInit();
              }
            })();

      const nextValue =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next;

      const serialized = JSON.stringify(nextValue);
      setItem(key, serialized);
      window.dispatchEvent(
        new StorageEvent("storage", { key, newValue: serialized })
      );
    },
    [key, resolveInit]
  );

  const removeValue = useCallback(() => {
    if (isServer) return;
    removeItem(key);
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: null }));
  }, [key]);

  return [value, setValue, removeValue] as const;
}