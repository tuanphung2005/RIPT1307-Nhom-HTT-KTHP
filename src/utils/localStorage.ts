/**
 * LocalStorage utility with error handling and fallback
 * NOT USED - keeping for reference only
 * The simplified authentication uses basic localStorage operations directly
 */

/*
interface StorageItem {
  value: any;
  timestamp: number;
  expiry?: number; // Optional expiry time in milliseconds
}

class LocalStorageManager {
  private prefix = 'forum_';
  
  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate storage key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Set item in localStorage with optional expiry
   */
  setItem(key: string, value: any, expiryMs?: number): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      const item: StorageItem = {
        value,
        timestamp: Date.now(),
        expiry: expiryMs ? Date.now() + expiryMs : undefined,
      };

      localStorage.setItem(this.getKey(key), JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Error setting localStorage item "${key}":`, error);
      return false;
    }
  }

  /**
   * Get item from localStorage with expiry check
   */
  getItem<T = any>(key: string): T | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const rawItem = localStorage.getItem(this.getKey(key));
      if (!rawItem) {
        return null;
      }

      const item: StorageItem = JSON.parse(rawItem);

      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error(`Error getting localStorage item "${key}":`, error);
      this.removeItem(key); // Remove corrupted item
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Error removing localStorage item "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all items with the forum prefix
   */
  clear(): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    try {
      const keys = Object.keys(localStorage);
      const forumKeys = keys.filter(key => key.startsWith(this.prefix));
      
      forumKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get all forum-related keys
   */
  getKeys(): string[] {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Check if a key exists and is not expired
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  /**
   * Get storage size information
   */
  getStorageInfo(): { used: number; total: number; available: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, total: 0, available: 0 };
    }

    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate total localStorage size (usually around 5-10MB)
      const total = 10 * 1024 * 1024; // 10MB estimate
      const available = total - used;

      return { used, total, available };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, total: 0, available: 0 };
    }
  }

  /**
   * Cleanup expired items
   */
  cleanup(): number {
    if (!this.isStorageAvailable()) {
      return 0;
    }

    let cleaned = 0;
    const keys = this.getKeys();

    keys.forEach(key => {
      // This will automatically remove expired items
      this.getItem(key);
    });

    return cleaned;
  }
}

// Export singleton instance
export const localStorage = new LocalStorageManager();
export default localStorage;
