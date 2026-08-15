import { create } from 'zustand';

export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

interface OfflineQueueState {
  queue: QueuedAction[];
  enqueueAction: (action: Omit<QueuedAction, 'id' | 'timestamp'>) => void;
  flushQueue: () => Promise<void>;
  clearQueue: () => void;
}

export const useOfflineQueue = create<OfflineQueueState>((set, get) => ({
  queue: [],
  enqueueAction: (action) => {
    set((state) => ({
      queue: [
        ...state.queue,
        {
          ...action,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
        },
      ],
    }));
  },
  flushQueue: async () => {
    const { queue, clearQueue } = get();
    if (queue.length === 0) return;
    
    console.log(`Flushing ${queue.length} offline actions...`);
    
    // Simulate processing
    // In a real implementation, you would iterate and process each action:
    // for (const action of queue) {
    //   await processAction(action);
    // }
    
    clearQueue();
  },
  clearQueue: () => set({ queue: [] }),
}));
