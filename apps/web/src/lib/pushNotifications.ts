
import { getToken } from "firebase/messaging";
import { apiPrivate } from "@/lib/api";
import {
    firebaseVapidKey,
    getFirebaseMessaging,
} from "@/lib/firebase";

export async function registerCurrentDevice(): Promise<void> {
    if (Notification.permission !== "granted") {
        return;
    }

    if (!firebaseVapidKey) {
        throw new Error("Firebase VAPID key is missing.");
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
        throw new Error("Firebase Messaging is unsupported.");
    }

    const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
        vapidKey: firebaseVapidKey,
        serviceWorkerRegistration: registration,
    });

    if (!token) {
        throw new Error("Could not obtain an FCM token.");
    }

    await apiPrivate.post("/fcm-tokens", {
        token,
        platform: "WEB",
        deviceName: navigator.userAgent,
    });
}

export async function requestPushPermission(): Promise<void> {
    if (
        !("Notification" in window) ||
        !("serviceWorker" in navigator)
    ) {
        throw new Error(
            "Push notifications are not supported in this browser."
        );
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        return;
    }

    await registerCurrentDevice();
}
