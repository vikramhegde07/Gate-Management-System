
import prisma from "../lib/prisma";
import { firebaseMessaging } from "../lib/firebase";

interface PushNotificationInput {
    userIds: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
}

const INVALID_TOKEN_ERRORS = new Set([
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
]);

export const sendPushNotification = async (
    input: PushNotificationInput
): Promise<void> => {
    const userIds = [...new Set(input.userIds)];

    if (userIds.length === 0) {
        return;
    }

    const devices = await prisma.fCMToken.findMany({
        where: {
            userId: { in: userIds },
            isActive: true,
        },
        select: {
            id: true,
            token: true,
        },
    });

    if (devices.length === 0) {
        return;
    }

    // Firebase multicast sends at most 500 tokens per call.
    for (let start = 0; start < devices.length; start += 500) {
        const batch = devices.slice(start, start + 500);

        try {
            const result =
                await firebaseMessaging.sendEachForMulticast({
                    tokens: batch.map((device) => device.token),

                    notification: {
                        title: input.title,
                        body: input.body,
                    },

                    data: input.data ?? {},

                    webpush: {
                        notification: {
                            title: input.title,
                            body: input.body,
                        },
                    },
                });

            const invalidDeviceIds: string[] = [];

            result.responses.forEach((response, index) => {
                if (
                    !response.success &&
                    response.error &&
                    INVALID_TOKEN_ERRORS.has(response.error.code)
                ) {
                    invalidDeviceIds.push(batch[index]!.id);
                }
            });

            if (invalidDeviceIds.length > 0) {
                await prisma.fCMToken.updateMany({
                    where: {
                        id: { in: invalidDeviceIds },
                    },
                    data: {
                        isActive: false,
                    },
                });
            }

            if (result.failureCount > 0) {
                console.warn(
                    `FCM batch: ${result.successCount} succeeded, ` +
                    `${result.failureCount} failed.`
                );
            }
        } catch (error) {
            // Push failure must not invalidate the in-app notification.
            console.error("FCM batch send failed:", error);
        }
    }
};
