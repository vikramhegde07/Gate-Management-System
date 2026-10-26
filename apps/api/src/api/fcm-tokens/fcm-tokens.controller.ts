
import type { Request, Response } from "express";
import type { DevicePlatform } from "../../generated/prisma/enums";

import prisma from "../../lib/prisma";

const validPlatforms = ["WEB", "ANDROID", "IOS"] as const;

const getAuthenticatedUserId = (req: Request): string | null => {
    return req.user?.id ?? null;
};

/**
 * Register or update an FCM device token.
 *
 * POST /api/v1/fcm-tokens
 *
 * Body:
 * {
 *   "token": "...",
 *   "platform": "WEB",
 *   "deviceName": "Firefox on Linux"
 * }
 */
export const registerDevice = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const { token, platform, deviceName } = req.body;

    if (
        typeof token !== "string" ||
        !token.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "A valid FCM token is required",
        });
    }

    if (
        typeof platform !== "string" ||
        !validPlatforms.includes(
            platform as (typeof validPlatforms)[number]
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "A valid platform is required: WEB, ANDROID, or IOS",
        });
    }

    if (
        deviceName !== undefined &&
        deviceName !== null &&
        typeof deviceName !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Device name must be a string or null",
        });
    }

    const normalizedToken = token.trim();
    const normalizedDeviceName =
        typeof deviceName === "string"
            ? deviceName.trim() || null
            : null;

    const now = new Date();

    // The token is globally unique. If this browser/device token
    // belongs to another account, registration transfers ownership
    // to the currently authenticated user.
    const device = await prisma.fCMToken.upsert({
        where: {
            token: normalizedToken,
        },
        create: {
            userId,
            token: normalizedToken,
            platform: platform as DevicePlatform,
            deviceName: normalizedDeviceName,
            isActive: true,
            lastUsedAt: now,
        },
        update: {
            userId,
            platform: platform as DevicePlatform,
            deviceName: normalizedDeviceName,
            isActive: true,
            lastUsedAt: now,
        },
        select: {
            id: true,
            platform: true,
            deviceName: true,
            isActive: true,
            lastUsedAt: true,
        },
    });

    return res.status(200).json({
        success: true,
        message: "Device registered successfully",
        data: device,
    });
};

/**
 * List the authenticated user's registered devices.
 *
 * GET /api/v1/fcm-tokens
 *
 * Raw FCM tokens are intentionally not returned.
 */
export const getDevices = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const devices = await prisma.fCMToken.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            platform: true,
            deviceName: true,
            isActive: true,
            lastUsedAt: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return res.status(200).json({
        success: true,
        data: devices,
    });
};

/**
 * Deactivate a device token.
 *
 * DELETE /api/v1/fcm-tokens/current
 *
 * Body:
 * {
 *   "token": "..."
 * }
 */
export const deactivateDevice = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const { token } = req.body;

    if (
        typeof token !== "string" ||
        !token.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "A valid FCM token is required",
        });
    }

    const result = await prisma.fCMToken.updateMany({
        where: {
            token: token.trim(),
            userId,
            isActive: true,
        },
        data: {
            isActive: false,
        },
    });

    return res.status(200).json({
        success: true,
        message: "Device deactivated successfully",
        data: {
            deactivated: result.count > 0,
        },
    });
};

/**
 * Update last-used time for an active device token.
 *
 * PATCH /api/v1/fcm-tokens/current/ping
 *
 * Body:
 * {
 *   "token": "..."
 * }
 */
export const pingDevice = async (
    req: Request,
    res: Response
) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const { token } = req.body;

    if (
        typeof token !== "string" ||
        !token.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "A valid FCM token is required",
        });
    }

    const result = await prisma.fCMToken.updateMany({
        where: {
            token: token.trim(),
            userId,
            isActive: true,
        },
        data: {
            lastUsedAt: new Date(),
        },
    });

    if (result.count === 0) {
        return res.status(404).json({
            success: false,
            message: "Active device token not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Device activity updated",
    });
};
