
import type { Request, Response } from "express";

import prisma from "../../lib/prisma";
import {
    successResponse,
    errorResponse,
} from "../../utils/response";

/*
========================================
HELPERS
========================================
*/

const getAuthenticatedUserId = (req: Request): string | null => {
    return req.user?.id ?? null;
};

const getPaginationParams = (req: Request) => {
    const pageValue = String(req.query.page ?? "1");
    const limitValue = String(req.query.limit ?? "20");

    const page = Number(pageValue);
    const limit = Number(limitValue);

    if (
        !Number.isSafeInteger(page) ||
        !Number.isSafeInteger(limit) ||
        page < 1 ||
        limit < 1 ||
        limit > 50
    ) {
        return null;
    }

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

/*
========================================
GET NOTIFICATIONS
========================================

GET /api/v1/notifications

Query parameters:
- page: optional, defaults to 1
- limit: optional, defaults to 20, maximum 50
- unreadOnly: optional, true or false

Returns active notifications belonging to the
authenticated user, newest first.
*/

export const getNotifications = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return errorResponse(res, "Unauthorized", 401);
    }

    const pagination = getPaginationParams(req);

    if (!pagination) {
        return errorResponse(
            res,
            "Invalid pagination parameters",
            400
        );
    }

    const unreadOnlyValue = req.query.unreadOnly;

    if (
        unreadOnlyValue !== undefined &&
        unreadOnlyValue !== "true" &&
        unreadOnlyValue !== "false"
    ) {
        return errorResponse(
            res,
            "unreadOnly must be true or false",
            400
        );
    }

    const unreadOnly = unreadOnlyValue === "true";
    const now = new Date();

    const where = {
        userId,
        dismissedAt: null,
        ...(unreadOnly ? { readAt: null } : {}),
        notification: {
            is: {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
        },
    };

    const [notifications, total] = await Promise.all([
        prisma.notificationRecipient.findMany({
            where,
            include: {
                notification: true,
            },
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" },
            ],
            skip: pagination.skip,
            take: pagination.limit,
        }),

        prisma.notificationRecipient.count({
            where,
        }),
    ]);

    return successResponse(
        res,
        {
            notifications,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                totalPages: Math.ceil(total / pagination.limit),
            },
        },
        "Notifications fetched successfully"
    );
};

/*
========================================
GET UNREAD COUNT
========================================

GET /api/v1/notifications/unread-count
*/

export const getUnreadCount = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return errorResponse(res, "Unauthorized", 401);
    }

    const now = new Date();

    const unreadCount = await prisma.notificationRecipient.count({
        where: {
            userId,
            readAt: null,
            dismissedAt: null,
            notification: {
                is: {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: now } },
                    ],
                },
            },
        },
    });

    return successResponse(
        res,
        { unreadCount },
        "Unread notification count fetched successfully"
    );
};

/*
========================================
MARK ONE NOTIFICATION AS READ
========================================

PATCH /api/v1/notifications/:recipientId/read

The recipient record must belong to the
authenticated user.
*/

export const markNotificationAsRead = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);
    const recipientId = req.params.recipientId as string;

    if (!userId) {
        return errorResponse(res, "Unauthorized", 401);
    }

    if (!recipientId) {
        return errorResponse(
            res,
            "Recipient ID is required",
            400
        );
    }

    const recipient = await prisma.notificationRecipient.findFirst({
        where: {
            id: recipientId,
            userId,
        },
        select: {
            id: true,
            readAt: true,
        },
    });

    if (!recipient) {
        return errorResponse(
            res,
            "Notification not found",
            404
        );
    }

    if (recipient.readAt) {
        return successResponse(
            res,
            recipient,
            "Notification is already marked as read"
        );
    }

    // Conditional update prevents overwriting an existing readAt
    // if another request marks this notification as read first.
    await prisma.notificationRecipient.updateMany({
        where: {
            id: recipientId,
            userId,
            readAt: null,
        },
        data: {
            readAt: new Date(),
        },
    });

    const updatedRecipient =
        await prisma.notificationRecipient.findFirst({
            where: {
                id: recipientId,
                userId,
            },
            select: {
                id: true,
                notificationId: true,
                readAt: true,
                dismissedAt: true,
            },
        });

    return successResponse(
        res,
        updatedRecipient,
        "Notification marked as read"
    );
};

/*
========================================
MARK ALL NOTIFICATIONS AS READ
========================================

PATCH /api/v1/notifications/read-all

Only active, non-dismissed notifications that
are currently unread will be updated.
*/

export const markAllNotificationsAsRead = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return errorResponse(res, "Unauthorized", 401);
    }

    const now = new Date();

    const result = await prisma.notificationRecipient.updateMany({
        where: {
            userId,
            readAt: null,
            dismissedAt: null,
            notification: {
                is: {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: now } },
                    ],
                },
            },
        },
        data: {
            readAt: now,
        },
    });

    return successResponse(
        res,
        {
            updatedCount: result.count,
        },
        "All notifications marked as read"
    );
};

/*
========================================
DISMISS ONE NOTIFICATION
========================================

PATCH /api/v1/notifications/:recipientId/dismiss
*/

export const dismissNotification = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);
    const recipientId = req.params.recipientId as string;

    if (!userId) {
        return errorResponse(res, "Unauthorized", 401);
    }

    if (!recipientId) {
        return errorResponse(
            res,
            "Recipient ID is required",
            400
        );
    }

    const recipient = await prisma.notificationRecipient.findFirst({
        where: {
            id: recipientId,
            userId,
        },
        select: {
            id: true,
            dismissedAt: true,
        },
    });

    if (!recipient) {
        return errorResponse(
            res,
            "Notification not found",
            404
        );
    }

    if (recipient.dismissedAt) {
        return successResponse(
            res,
            recipient,
            "Notification is already dismissed"
        );
    }

    // Preserve the original dismissal timestamp on retries.
    await prisma.notificationRecipient.updateMany({
        where: {
            id: recipientId,
            userId,
            dismissedAt: null,
        },
        data: {
            dismissedAt: new Date(),
        },
    });

    const updatedRecipient =
        await prisma.notificationRecipient.findFirst({
            where: {
                id: recipientId,
                userId,
            },
            select: {
                id: true,
                notificationId: true,
                readAt: true,
                dismissedAt: true,
            },
        });

    return successResponse(
        res,
        updatedRecipient,
        "Notification dismissed successfully"
    );
};

/*
========================================
DISMISS ALL NOTIFICATIONS
========================================

PATCH /api/v1/notifications/dismiss-all

Only active, non-dismissed notifications will
be updated. Existing readAt values are preserved.
*/

export const dismissAllNotifications = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return errorResponse(res, "Unauthorized", 401);
    }

    const now = new Date();

    const result = await prisma.notificationRecipient.updateMany({
        where: {
            userId,
            dismissedAt: null,
            notification: {
                is: {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: now } },
                    ],
                },
            },
        },
        data: {
            dismissedAt: now,
        },
    });

    return successResponse(
        res,
        {
            dismissedCount: result.count,
        },
        "All notifications dismissed successfully"
    );
};
