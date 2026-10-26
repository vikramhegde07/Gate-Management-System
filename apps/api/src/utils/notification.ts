
import prisma from "../lib/prisma";
import type { Prisma } from "../generated/prisma/client";

/*
========================================
CREATE NOTIFICATION
========================================

Creates the notification content and returns
the newly created notification ID.
*/

interface CreateNotificationInput {
    propertyId?: string | null;
    type: string;
    title: string;
    body: string;
    entityType?: string | null;
    entityId?: string | null;
    data?: Prisma.InputJsonValue;
    expiresAt?: Date | null;
}

export const createNotification = async (
    input: CreateNotificationInput
): Promise<string> => {
    const notification = await prisma.notification.create({
        data: {
            type: input.type,
            title: input.title,
            body: input.body,

            ...(input.propertyId !== undefined && {
                propertyId: input.propertyId,
            }),

            ...(input.entityType !== undefined && {
                entityType: input.entityType,
            }),

            ...(input.entityId !== undefined && {
                entityId: input.entityId,
            }),

            ...(input.data !== undefined
                ? { data: input.data }
                : {}),
            ...(input.expiresAt !== undefined
                ? { expiresAt: input.expiresAt }
                : {}),
        },
        select: {
            id: true,
        },
    });

    return notification.id;
};

/*
========================================
CREATE NOTIFICATION RECIPIENTS
========================================

Creates recipient records for the supplied
user IDs.

Duplicate user IDs in the input are removed.
Existing notification/user pairs are skipped.
*/

interface CreateNotificationRecipientsInput {
    notificationId: string;
    userIds: string[];
}

export const createNotificationRecipients = async (
    input: CreateNotificationRecipientsInput
): Promise<number> => {
    const uniqueUserIds = [
        ...new Set(input.userIds),
    ];

    if (uniqueUserIds.length === 0) {
        throw new Error(
            "At least one notification recipient is required"
        );
    }

    if (uniqueUserIds.some((userId) => !userId.trim())) {
        throw new Error(
            "Notification recipient user IDs cannot be empty"
        );
    }

    const result =
        await prisma.notificationRecipient.createMany({
            data: uniqueUserIds.map((userId) => ({
                notificationId: input.notificationId,
                userId,
            })),
            skipDuplicates: true,
        });

    return result.count;
};
