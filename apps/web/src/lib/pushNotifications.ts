
import { getMessaging, onRegistered, register } from "firebase/messaging";
import { apiPrivate } from "@/lib/api";
import {
    firebaseVapidKey,
} from "@/lib/firebase";

export async function registerCurrentDevice(): Promise<void> {
    if (Notification.permission !== "granted") {
        return;
    }

    if (!firebaseVapidKey) {
        throw new Error("Firebase VAPID key is missing.");
    }

    const messaging = getMessaging();

    if (!messaging) {
        throw new Error("Firebase Messaging is unsupported.");
    }

    const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
    );

    onRegistered(messaging, async (installationId) => {

        await apiPrivate.post("/fcm-tokens", {
            token: installationId,
            platform: "WEB",
            deviceName: navigator.userAgent,
        });
    });

    register(messaging, {
        vapidKey: firebaseVapidKey,
        serviceWorkerRegistration: registration,
    })

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
