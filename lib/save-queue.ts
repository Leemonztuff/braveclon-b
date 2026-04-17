/**
 * SAVE QUEUE - Offline Queue for Supabase Saves
 * 
 * Provides offline persistence when Supabase is unavailable.
 * Queues saves locally and replays them when connection is restored.
 * 
 * Complexity: LOW
 * Public API:
 * - initSaveQueue() → initializes the queue
 * - queueSave(userId, state) → enqueues a save operation
 * - processQueue() → processes all queued saves
 * - getQueueLength() → returns pending save count
 */

import { PlayerState } from './economyTypes';
import { supabase } from './supabase';
import { saveGameState as cloudSaveGameState } from './auth';

const QUEUE_KEY = 'rpg_save_queue';
const MAX_QUEUE_SIZE = 50;
const RETRY_DELAY_MS = 5000;

interface QueuedSave {
  id: string;
  timestamp: number;
  state: PlayerState;
  retries: number;
}

interface SaveQueue {
  saves: QueuedSave[];
  lastProcessed: number;
}

// ============================================================================
// PURE FUNCTIONS
// ============================================================================

/**
 * Get the save queue from localStorage
 */
function getQueue(key: string = QUEUE_KEY): SaveQueue {
  if (typeof window === 'undefined') {
    return { saves: [], lastProcessed: 0 };
  }
  
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load save queue:', e);
  }
  
  return { saves: [], lastProcessed: 0 };
}

/**
 * Save queue to localStorage
 */
function saveQueue(queue: SaveQueue, key: string = QUEUE_KEY): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Limit queue size
    const trimmedQueue: SaveQueue = {
      ...queue,
      saves: queue.saves.slice(-MAX_QUEUE_SIZE),
    };
    localStorage.setItem(key, JSON.stringify(trimmedQueue));
  } catch (e) {
    console.error('Failed to save queue:', e);
  }
}

/**
 * Generate unique ID for a save operation
 */
function generateSaveId(): string {
  return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Initialize the save queue system
 * Call this on app startup
 */
export function initSaveQueue(): void {
  const queue = getQueue();
  
  if (queue.saves.length > 0) {
    console.log(`Found ${queue.saves.length} queued saves, will process on next online event`);
    
    // Attempt to process queue immediately
    if (typeof window !== 'undefined') {
      processQueue().catch(console.error);
    }
  }
  
  // Set up online listener
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Connection restored, processing save queue...');
      processQueue().catch(console.error);
    });
  }
}

/**
 * Queue a save operation for later processing
 */
export function queueSave(userId: string, state: PlayerState): boolean {
  // If Supabase is available, save immediately
  if (supabase) {
    cloudSaveGameState(userId, state).catch(console.error);
    return true;
  }
  
  // Otherwise queue for later
  const queue = getQueue();
  
  const newSave: QueuedSave = {
    id: generateSaveId(),
    timestamp: Date.now(),
    state,
    retries: 0,
  };
  
  const updatedQueue: SaveQueue = {
    saves: [...queue.saves, newSave].slice(-MAX_QUEUE_SIZE),
    lastProcessed: queue.lastProcessed,
  };
  
  saveQueue(updatedQueue);
  
  console.log(`Queued save (${updatedQueue.saves.length} total)`);
  return true;
}

/**
 * Process all queued saves
 * Returns number of successfully processed saves
 */
export async function processQueue(): Promise<number> {
  if (!supabase) {
    console.log('Supabase not available, cannot process queue');
    return 0;
  }
  
  const queue = getQueue();
  
  if (queue.saves.length === 0) {
    return 0;
  }
  
  let processed = 0;
  const remaining: QueuedSave[] = [];
  
  for (const save of queue.saves) {
    try {
      const success = await cloudSaveGameState('queued_user', save.state);
      
      if (success) {
        processed++;
      } else {
        // Add back to queue if failed (with retry count)
        const retryable = { ...save, retries: save.retries + 1 };
        
        // Only retry up to 3 times
        if (retryable.retries < 3) {
          remaining.push(retryable);
        } else {
          console.warn(`Dropping save after 3 failed attempts: ${save.id}`);
        }
      }
    } catch (e) {
      console.error('Failed to process queued save:', e);
      remaining.push({ ...save, retries: save.retries + 1 });
    }
  }
  
  // Save remaining back to queue
  const updatedQueue: SaveQueue = {
    saves: remaining,
    lastProcessed: Date.now(),
  };
  
  saveQueue(updatedQueue);
  
  if (processed > 0) {
    console.log(`Processed ${processed} queued saves, ${remaining.length} remaining`);
  }
  
  return processed;
}

/**
 * Get the number of pending saves in the queue
 */
export function getQueueLength(): number {
  return getQueue().saves.length;
}

/**
 * Clear the save queue (use with caution)
 */
export function clearQueue(): void {
  saveQueue({ saves: [], lastProcessed: Date.now() });
  console.log('Save queue cleared');
}

/**
 * Check if we're online and can save to cloud
 */
export function isOnline(): boolean {
  return typeof window !== 'undefined' && navigator.onLine && supabase !== null;
}