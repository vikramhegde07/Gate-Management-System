
import { useEffect } from "react";
import toast from "react-hot-toast";
import { registerCurrentDevice } from "@/lib/pushNotifications";

export function usePushNotifications(isAuthenticated: boolean) {
    useEffect(() => {
        if (
            !isAuthenticated ||
            !("Notification" in window) ||
            Notification.permission !== "granted"
        ) {
            return;
        }

        void registerCurrentDevice().catch((error: unknown) => {
            console.error("FCM device registration failed:", error);
            toast.error("Could not register this device for push notifications.");
        });
    }, [isAuthenticated]);
}
