import { OfflineService } from './offlineService';
import { SyncQueueItem, SyncStatus } from '@/types/offline';

export class SyncService {
  private static isSyncing = false;
  private static syncCallbacks: Array<(status: SyncStatus) => void> = [];

  static subscribe(callback: (status: SyncStatus) => void) {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  private static notifySubscribers(status: SyncStatus) {
    this.syncCallbacks.forEach(callback => callback(status));
  }

  static async syncAll(): Promise<void> {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('📡 Offline, skipping sync');
      return;
    }

    this.isSyncing = true;
    const queue = OfflineService.getSyncQueue();
    const errors: SyncQueueItem[] = [];

    this.notifySubscribers({
      isSyncing: true,
      pendingCount: queue.length,
      errors: [],
    });

    console.log(`🔄 Starting sync: ${queue.length} items in queue`);

    for (const item of queue) {
      // Skip items that exceeded max retries
      if (item.retries >= item.maxRetries) {
        errors.push(item);
        continue;
      }

      try {
        await this.syncItem(item);
        OfflineService.removeSyncItem(item.id);
        console.log(`✅ Synced item ${item.id}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to sync item ${item.id}:`, errorMsg);
        OfflineService.markItemAsFailed(item.id, errorMsg);
        errors.push({ ...item, error: errorMsg });
      }
    }

    OfflineService.updateLastSync();
    this.isSyncing = false;

    const remainingQueue = OfflineService.getSyncQueue();
    this.notifySubscribers({
      isSyncing: false,
      pendingCount: remainingQueue.length,
      lastSync: new Date(),
      errors,
    });

    console.log(`✨ Sync complete: ${errors.length} errors, ${remainingQueue.length} items remaining`);
  }

  private static async syncItem(item: SyncQueueItem): Promise<void> {
    const { type, action, data } = item;

    // TODO: Remplacer par de vrais appels API
    // Pour l'instant, simulation
    await new Promise(resolve => setTimeout(resolve, 500));

    if (type === 'plein' && action === 'create') {
      // Simuler l'appel API
      console.log('📤 Would POST to /api/pleins:', data);
      
      // En production, cela serait :
      // const response = await fetch('/api/pleins', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) throw new Error('Failed to sync plein');
      
      // Nettoyer les données locales après succès
      OfflineService.removePleinOffline(data._tempId);
    }

    if (type === 'trajet' && action === 'create') {
      console.log('📤 Would POST to /api/trajets:', data);
      OfflineService.removeTrajetOffline(data._tempId);
    }

    // Simuler un échec aléatoire pour tester la logique de retry (à retirer en prod)
    // if (Math.random() < 0.2) {
    //   throw new Error('Simulated sync error');
    // }
  }

  static getSyncStatus(): SyncStatus {
    const queue = OfflineService.getSyncQueue();
    const lastSync = OfflineService.getLastSync();
    const errors = queue.filter(item => item.error && item.retries >= item.maxRetries);

    return {
      isSyncing: this.isSyncing,
      pendingCount: queue.length,
      lastSync: lastSync ? new Date(lastSync) : undefined,
      errors,
    };
  }
}
