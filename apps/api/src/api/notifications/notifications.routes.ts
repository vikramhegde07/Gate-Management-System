
import express from "express";

import { verifyJWT } from "../../middlewares/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";

import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
    dismissAllNotifications,
} from "./notifications.controller";

const router = express.Router();

/*
========================================
AUTHENTICATION
========================================
*/

router.use(verifyJWT);

/*
========================================
NOTIFICATION RECIPIENT ROUTES
========================================
*/

// Get notifications for the authenticated user
router.get(
    "/",
    asyncHandler(getNotifications)
);

// Get unread notification count
router.get(
    "/unread-count",
    asyncHandler(getUnreadCount)
);

// Mark one notification as read
router.patch(
    "/:recipientId/read",
    asyncHandler(markNotificationAsRead)
);

// Mark all notifications as read
router.patch(
    "/read-all",
    asyncHandler(markAllNotificationsAsRead)
);

// Dismiss one notification
router.patch(
    "/:recipientId/dismiss",
    asyncHandler(dismissNotification)
);

// Dismiss all notifications
router.patch(
    "/dismiss-all",
    asyncHandler(dismissAllNotifications)
);

export default router;
