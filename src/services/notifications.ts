/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type NotificationCallback = (title: string, body: string, messageId?: string) => void;

class AppNotificationService {
  private permission: NotificationPermission = 'default';
  private callbacks: Set<NotificationCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Capacitor Native permission request would go here
    const win = window as any;
    if (win.Capacitor && win.Capacitor.Plugins && win.Capacitor.Plugins.LocalNotifications) {
      try {
        const result = await win.Capacitor.Plugins.LocalNotifications.requestPermissions();
        return result.display === 'granted';
      } catch (e) {
        console.warn('Native LocalNotifications permission failed', e);
      }
    }

    // Web Fallback
    if ('Notification' in window) {
      try {
        const status = await Notification.requestPermission();
        this.permission = status;
        return status === 'granted';
      } catch (e) {
        console.warn('Web Notification request failed', e);
      }
    }

    return false;
  }

  hasPermission(): boolean {
    if (typeof window === 'undefined') return false;
    
    const win = window as any;
    if (win.Capacitor && win.Capacitor.Plugins && win.Capacitor.Plugins.LocalNotifications) {
      // Native environments manage this async, we fallback to checked state or assume true if granted once
    }

    return this.permission === 'granted';
  }

  onNotificationClick(callback: NotificationCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  sendNotification(title: string, body: string, messageId?: string): void {
    // 1. Dispatch callbacks for in-app alert or state updates
    this.callbacks.forEach((cb) => {
      try {
        cb(title, body, messageId);
      } catch (e) {
        console.error(e);
      }
    });

    if (typeof window === 'undefined') return;

    // 2. Trigger Native local notifications if Capacitor is running
    const win = window as any;
    if (win.Capacitor && win.Capacitor.Plugins && win.Capacitor.Plugins.LocalNotifications) {
      try {
        win.Capacitor.Plugins.LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 100000),
              extra: { messageId },
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'default',
              actionTypeId: 'OPEN_EMAIL',
            },
          ],
        });
        return;
      } catch (e) {
        console.warn('Native Notification schedule failed', e);
      }
    }

    // 3. Fallback to web standard Notification if granted
    if ('Notification' in window && this.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: messageId,
        });

        notification.onclick = () => {
          window.focus();
          // Notify app router if necessary
        };
      } catch (e) {
        console.warn('Web Notification dispatch failed', e);
      }
    }
  }
}

export const NotificationService = new AppNotificationService();
