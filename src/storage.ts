interface StorageItem {
  value: string;
}

class Storage {
  async get(key: string, _parse: boolean = false): Promise<StorageItem | null> {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;
      return { value };
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, _persist: boolean = false): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
}

declare global {
  interface Window {
    storage: Storage;
  }
}

if (typeof window !== 'undefined') {
  window.storage = new Storage();
}

export default Storage;
