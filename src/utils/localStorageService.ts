/**
 * Local Storage Service - Offline-First Data Management
 * All data is stored in localStorage first, then synced to backend on demand
 */

export interface SyncStatus {
  lastSync: string | null;
  pendingChanges: number;
  isSyncing: boolean;
  syncError: string | null;
}

const STORAGE_KEYS = {
  PRESCRIPTIONS: 'pharmacare_prescriptions',
  MEDICINES: 'pharmacare_medicines',
  PATIENTS: 'pharmacare_patients',
  SUPPLIERS: 'pharmacare_suppliers',
  SALES: 'pharmacare_sales',
  SYNC_STATUS: 'pharmacare_sync_status',
  PENDING_SYNC: 'pharmacare_pending_sync'
};

/**
 * Generic local storage operations
 */
export class LocalStorageService {
  /**
   * Get all items from a collection
   */
  static getAll<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return [];
    }
  }

  /**
   * Get single item by ID
   */
  static getById<T extends { id: string }>(key: string, id: string): T | null {
    try {
      const items = this.getAll<T>(key);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error getting item by ID from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Set all items in a collection
   */
  static setAll<T>(key: string, items: T[], skipSyncMarking = false): void {
    try {
      localStorage.setItem(key, JSON.stringify(items));
      if (!skipSyncMarking) {
        this.markPendingSync(key);
      }
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      throw error;
    }
  }

  /**
   * Create a new item
   */
  static create<T extends { id?: string }>(key: string, item: T): T {
    try {
      const items = this.getAll<T>(key);
      const newItem = {
        ...item,
        id: item.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _localOnly: true // Mark as not synced yet
      } as T;
      
      items.push(newItem);
      this.setAll(key, items);
      
      return newItem;
    } catch (error) {
      console.error(`Error creating item in localStorage (${key}):`, error);
      throw error;
    }
  }

  /**
   * Update an existing item
   */
  static update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
    try {
      const items = this.getAll<T>(key);
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        return null;
      }
      
      items[index] = {
        ...items[index],
        ...updates,
        updated_at: new Date().toISOString(),
        _localOnly: true
      } as T;
      
      this.setAll(key, items);
      return items[index];
    } catch (error) {
      console.error(`Error updating item in localStorage (${key}):`, error);
      throw error;
    }
  }

  /**
   * Delete an item
   */
  static delete(key: string, id: string): boolean {
    try {
      const items = this.getAll(key);
      const filtered = items.filter((item: any) => item.id !== id);
      
      if (filtered.length === items.length) {
        return false; // Item not found
      }
      
      this.setAll(key, filtered);
      return true;
    } catch (error) {
      console.error(`Error deleting item from localStorage (${key}):`, error);
      throw error;
    }
  }

  /**
   * Mark that a collection has pending changes
   */
  static markPendingSync(key: string): void {
    try {
      const pending = this.getPendingSync();
      if (!pending.includes(key)) {
        pending.push(key);
        localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        
        // Update sync status only if pending changes actually changed
        this.updateSyncStatus({ pendingChanges: pending.length });
      }
    } catch (error) {
      console.error('Error marking pending sync:', error);
    }
  }

  /**
   * Get collections with pending changes
   */
  static getPendingSync(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending sync:', error);
      return [];
    }
  }

  /**
   * Clear pending sync for a collection
   */
  static clearPendingSync(key: string): void {
    try {
      const pending = this.getPendingSync().filter(k => k !== key);
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
      
      // Update sync status
      this.updateSyncStatus({ pendingChanges: pending.length });
    } catch (error) {
      console.error('Error clearing pending sync:', error);
    }
  }

  /**
   * Get sync status
   */
  static getSyncStatus(): SyncStatus {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
      return data ? JSON.parse(data) : {
        lastSync: null,
        pendingChanges: 0,
        isSyncing: false,
        syncError: null
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        lastSync: null,
        pendingChanges: 0,
        isSyncing: false,
        syncError: null
      };
    }
  }

  /**
   * Update sync status
   */
  static updateSyncStatus(updates: Partial<SyncStatus>): void {
    try {
      const current = this.getSyncStatus();
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(updated));
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('syncStatusChanged', { detail: updated }));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  /**
   * Clear all local data
   */
  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

/**
 * Prescription-specific operations
 */
export class PrescriptionStorage {
  static getAll() {
    return LocalStorageService.getAll<any>(STORAGE_KEYS.PRESCRIPTIONS);
  }

  static getById(id: string) {
    return LocalStorageService.getById<any>(STORAGE_KEYS.PRESCRIPTIONS, id);
  }

  static create(prescription: any) {
    return LocalStorageService.create(STORAGE_KEYS.PRESCRIPTIONS, prescription);
  }

  static update(id: string, updates: any) {
    return LocalStorageService.update(STORAGE_KEYS.PRESCRIPTIONS, id, updates);
  }

  static delete(id: string) {
    return LocalStorageService.delete(STORAGE_KEYS.PRESCRIPTIONS, id);
  }

  static getPending() {
    return this.getAll().filter((p: any) => p.status === 'Pending');
  }

  static getPaid() {
    return this.getAll().filter((p: any) => p.status === 'Paid');
  }
}

/**
 * Medicine-specific operations
 */
export class MedicineStorage {
  static getAll() {
    return LocalStorageService.getAll<any>(STORAGE_KEYS.MEDICINES);
  }

  static getById(id: string) {
    return LocalStorageService.getById<any>(STORAGE_KEYS.MEDICINES, id);
  }

  static create(medicine: any) {
    return LocalStorageService.create(STORAGE_KEYS.MEDICINES, medicine);
  }

  static update(id: string, updates: any) {
    return LocalStorageService.update(STORAGE_KEYS.MEDICINES, id, updates);
  }

  static delete(id: string) {
    return LocalStorageService.delete(STORAGE_KEYS.MEDICINES, id);
  }
}

/**
 * Patient-specific operations
 */
export class PatientStorage {
  static getAll() {
    return LocalStorageService.getAll<any>(STORAGE_KEYS.PATIENTS);
  }

  static getById(id: string) {
    return LocalStorageService.getById<any>(STORAGE_KEYS.PATIENTS, id);
  }

  static create(patient: any) {
    return LocalStorageService.create(STORAGE_KEYS.PATIENTS, patient);
  }

  static update(id: string, updates: any) {
    return LocalStorageService.update(STORAGE_KEYS.PATIENTS, id, updates);
  }

  static delete(id: string) {
    return LocalStorageService.delete(STORAGE_KEYS.PATIENTS, id);
  }
}

export { STORAGE_KEYS };
