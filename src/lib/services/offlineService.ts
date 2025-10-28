import { OfflineStorage, SyncQueueItem } from '@/types/offline';

const STORAGE_KEY = 'trackfuel_offline';

export class OfflineService {
  private static getStorage(): OfflineStorage {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        pleins: [],
        trajets: [],
        syncQueue: [],
      };
    }
    try {
      return JSON.parse(data);
    } catch {
      return {
        pleins: [],
        trajets: [],
        syncQueue: [],
      };
    }
  }

  private static saveStorage(storage: OfflineStorage): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  }

  // Gestion des pleins hors-ligne
  static savePleinOffline(plein: any): string {
    const storage = this.getStorage();
    const tempId = `temp_p_${Date.now()}`;
    const offlinePlein = {
      ...plein,
      id: tempId,
      _offline: true,
      _timestamp: Date.now(),
      _tempId: tempId,
    };
    
    storage.pleins.push(offlinePlein);
    
    // Ajouter à la file de synchronisation
    const syncItem: SyncQueueItem = {
      id: `sync_${Date.now()}`,
      type: 'plein',
      action: 'create',
      data: offlinePlein,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
    };
    storage.syncQueue.push(syncItem);
    
    this.saveStorage(storage);
    return tempId;
  }

  static getPleinsOffline(): any[] {
    return this.getStorage().pleins;
  }

  static removePleinOffline(tempId: string): void {
    const storage = this.getStorage();
    storage.pleins = storage.pleins.filter(p => p.id !== tempId);
    this.saveStorage(storage);
  }

  // Gestion des trajets hors-ligne
  static saveTrajetOffline(trajet: any): string {
    const storage = this.getStorage();
    const tempId = `temp_t_${Date.now()}`;
    const offlineTrajet = {
      ...trajet,
      id: tempId,
      _offline: true,
      _timestamp: Date.now(),
      _tempId: tempId,
    };
    
    storage.trajets.push(offlineTrajet);
    
    // Ajouter à la file de synchronisation
    const syncItem: SyncQueueItem = {
      id: `sync_${Date.now()}`,
      type: 'trajet',
      action: 'create',
      data: offlineTrajet,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
    };
    storage.syncQueue.push(syncItem);
    
    this.saveStorage(storage);
    return tempId;
  }

  static getTrajetsOffline(): any[] {
    return this.getStorage().trajets;
  }

  static removeTrajetOffline(tempId: string): void {
    const storage = this.getStorage();
    storage.trajets = storage.trajets.filter(t => t.id !== tempId);
    this.saveStorage(storage);
  }

  // Gestion de la file de synchronisation
  static getSyncQueue(): SyncQueueItem[] {
    return this.getStorage().syncQueue;
  }

  static removeSyncItem(itemId: string): void {
    const storage = this.getStorage();
    storage.syncQueue = storage.syncQueue.filter(item => item.id !== itemId);
    this.saveStorage(storage);
  }

  static updateSyncItem(itemId: string, updates: Partial<SyncQueueItem>): void {
    const storage = this.getStorage();
    const index = storage.syncQueue.findIndex(item => item.id === itemId);
    if (index !== -1) {
      storage.syncQueue[index] = { ...storage.syncQueue[index], ...updates };
      this.saveStorage(storage);
    }
  }

  static markItemAsFailed(itemId: string, error: string): void {
    const storage = this.getStorage();
    const item = storage.syncQueue.find(i => i.id === itemId);
    if (item) {
      item.retries += 1;
      item.error = error;
      item.lastAttempt = Date.now();
      
      // Si max retries atteint, on garde l'item mais on le marque comme échoué définitivement
      if (item.retries >= item.maxRetries) {
        console.error(`Sync item ${itemId} exceeded max retries`, item);
      }
      
      this.saveStorage(storage);
    }
  }

  static updateLastSync(): void {
    const storage = this.getStorage();
    storage.lastSync = Date.now();
    this.saveStorage(storage);
  }

  static getLastSync(): number | undefined {
    return this.getStorage().lastSync;
  }

  static clearAllOfflineData(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Gestion des photos (conversion base64)
  static async convertPhotoToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
