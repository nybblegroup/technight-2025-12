/**
 * Storage Service
 * 
 * Wrapper for chrome.storage.local API
 */

const StorageService = {
  /**
   * Get item from storage
   */
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  },
  
  /**
   * Set item in storage
   */
  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  },
  
  /**
   * Get multiple items
   */
  async getMultiple(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },
  
  /**
   * Set multiple items
   */
  async setMultiple(items) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => {
        resolve();
      });
    });
  },
  
  /**
   * Remove item
   */
  async remove(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve();
      });
    });
  },
  
  /**
   * Clear all storage
   */
  async clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  }
};

console.log('✅ StorageService loaded');

