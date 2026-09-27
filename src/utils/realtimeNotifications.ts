/**
 * Real-time notifications and cross-tab communication helper
 * Chez Bineta
 */

import { Order, OrderStatus } from '../types';
import { soundEffects } from './soundEffects';

export type RealtimeMessage =
  | {
      type: 'NEW_ORDER';
      order: Order;
      sender: 'customer';
      timestamp: number;
    }
  | {
      type: 'ORDER_ACCEPTED';
      orderId: string;
      order: Order;
      sender: 'seller';
      timestamp: number;
    }
  | {
      type: 'ORDER_REFUSED';
      orderId: string;
      reason: string;
      order: Order;
      sender: 'seller';
      timestamp: number;
    }
  | {
      type: 'ORDER_STATUS_CHANGED';
      orderId: string;
      status: OrderStatus;
      order: Order;
      sender: 'seller';
      timestamp: number;
    };

const CHANNEL_NAME = 'chez_bineta_realtime_v2';

class RealtimeNotificationHub {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: RealtimeMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel error, falling back to storage events', e);
      }
    }

    // Fallback: storage event for cross-tab if BroadcastChannel not fully supported
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'chez_bineta_realtime_event' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyListeners(data);
          } catch {}
        }
      });
    }
  }

  public subscribe(callback: (msg: RealtimeMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public broadcast(msg: RealtimeMessage): void {
    // Notify local listeners
    this.notifyListeners(msg);

    // Send through BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('Failed to postMessage on BroadcastChannel', e);
      }
    }

    // Also trigger via localStorage for maximum browser compatibility
    try {
      localStorage.setItem('chez_bineta_realtime_event', JSON.stringify({ ...msg, _t: Date.now() }));
    } catch {}
  }

  private notifyListeners(msg: RealtimeMessage): void {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in realtime listener', err);
      }
    });
  }

  // Browser system notifications (desktop & mobile push preview)
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  public isNotificationPermissionGranted(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  public showSystemNotification(title: string, options?: NotificationOptions): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch (e) {
        console.warn('Failed to show system notification', e);
      }
    }
  }
}

export const realtimeHub = new RealtimeNotificationHub();
