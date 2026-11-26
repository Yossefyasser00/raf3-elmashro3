"use client";

import { useEffect, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      // Register SW proactively and sync subscription if already granted
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(async (reg) => {
          let sub = await reg.pushManager.getSubscription();
          if (!sub && Notification.permission === "granted") {
            try {
              const vapidRes = await fetch(`${API_BASE}/api/v1/push/vapid-key`);
              const { publicKey } = await vapidRes.json();
              if (publicKey) {
                sub = await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
                });
              }
            } catch {
              // ignore silent re-subscribe failure
            }
          }
          setIsSubscribed(!!sub);

          // Sync existing subscription to current logged-in user
          const token = localStorage.getItem("fz_token");
          if (sub && token) {
            const subJson = sub.toJSON();
            fetch(`${API_BASE}/api/v1/push/subscribe`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                endpoint: subJson.endpoint,
                keys: {
                  p256dh: subJson.keys?.p256dh,
                  auth: subJson.keys?.auth,
                },
              }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;
    setIsLoading(true);
    try {
      // 1. Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 2. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setIsLoading(false);
        return false;
      }

      // 3. Get VAPID public key from backend
      const vapidRes = await fetch(`${API_BASE}/api/v1/push/vapid-key`);
      const { publicKey } = await vapidRes.json();

      // 4. Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
      });

      // 5. Send subscription to backend
      const token = localStorage.getItem("fz_token");
      if (!token) {
        setIsLoading(false);
        return false;
      }

      const subJson = subscription.toJSON();
      await fetch(`${API_BASE}/api/v1/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          },
        }),
      });

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        
        const token = localStorage.getItem("fz_token");
        if (token) {
          await fetch(`${API_BASE}/api/v1/push/unsubscribe`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint }),
          });
        }
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  }, []);

  return { permission, isSubscribed, isSupported, isLoading, subscribe, unsubscribe };
}
