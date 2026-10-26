import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import prisma from "../../lib/prisma";
import { PropertyRole, type Prisma } from "../../generated/prisma/client";
import {
    createNotification,
    createNotificationRecipients,
} from "../../utils/notification";
import { sendPushNotification } from "../../utils/pushNotification";

export const createVisitorEntry =
    asyncHandler(async (req: Request, res: Response) => {
        const {
            visitorName,
            visitorPhone,
            purpose,
            gateId,
            hostUserId,
            vehicleNumber,
            vehicleType,
            remarks,
        } = req.body;

        const propertyId = req.propertyAccess!.propertyId;

        const isSecurity =
            req.propertyAccess?.role === "SECURITY";

        // 1. Create the visitor entry
        const visitor = await prisma.visitorEntry.create({
            data: {
                propertyId,
                gateId,
                visitorName,
                visitorPhone,
                purpose,
                hostUserId,
                vehicleNumber,
                vehicleType,
                remarks,
                createdById: req.user!.id,

                status: isSecurity
                    ? "CHECKED_IN"
                    : "PENDING",

                checkInTime: isSecurity
                    ? new Date()
                    : null,
            },
        });

        /*
        ========================================
        NOTIFY ON-DUTY GUARDS
        ========================================

        Only pending visitor entries require approval.
        Guard-created entries are already checked in.
        */

        console.log("checking for security role");


        if (!isSecurity) {
            try {
                console.log("inside the notification creation");

                // 2. Find guards currently on duty at this gate
                const activeDuties = await prisma.gateDuty.findMany({
                    where: {
                        propertyId,
                        gateId,
                        endedAt: null,
                    },
                    select: {
                        guardUserId: true,
                    },
                    distinct: ["guardUserId"],
                });

                const guardUserIds = activeDuties.map(
                    (duty) => duty.guardUserId
                );

                if (guardUserIds.length > 0) {
                    // 3. Confirm these users still have active
                    // SECURITY access to this property
                    const activeGuards =
                        await prisma.propertyAccess.findMany({
                            where: {
                                propertyId,
                                userId: {
                                    in: guardUserIds,
                                },
                                role: "SECURITY",
                                isActive: true,
                            },
                            select: {
                                userId: true,
                            },
                        });

                    const recipientUserIds = [
                        ...new Set(
                            activeGuards.map(
                                (guard) => guard.userId
                            )
                        ),
                    ];

                    // 4. Create notification content and recipients
                    if (recipientUserIds.length > 0) {
                        const notificationId =
                            await createNotification({
                                propertyId,
                                type: "VISITOR_APPROVAL_REQUIRED",
                                title: "Visitor approval required",
                                body: "A visitor is waiting for approval.",
                                entityType: "VISITOR_ENTRY",
                                entityId: visitor.id,
                                data: {
                                    gateId,
                                },
                            });

                        await createNotificationRecipients({
                            notificationId,
                            userIds: recipientUserIds,
                        });

                        // After creating the notification and its recipients:
                        try {
                            await sendPushNotification({
                                userIds: recipientUserIds,
                                title: "Visitor approval required",
                                body: "A visitor is waiting for approval.",
                                data: {
                                    type: "VISITOR_APPROVAL_REQUIRED",
                                    entityType: "VISITOR_ENTRY",
                                    entityId: visitor.id,
                                    propertyId,
                                    gateId,
                                },
                            });
                        } catch (error) {
                            console.error("Push notification delivery failed:", error);
                        }
                    }
                }
            } catch (error) {
                // Notification failure should not undo an already
                // created visitor entry.
                console.error(
                    "Failed to create visitor approval notification:",
                    error
                );
            }
        }

        // 5. Return the created visitor entry
        return res.status(201).json({
            success: true,
            data: visitor,
        });
    });


export const approveVisitor =
    asyncHandler(async (req: Request, res: Response) => {

        const visitor =
            await prisma.visitorEntry.update({
                where: {
                    id: req.params.visitorId as string,
                },

                data: {
                    status: "CHECKED_IN",

                    approvedById:
                        req.user!.id,

                    checkInTime:
                        new Date(),
                },
            });

        return res.json({
            success: true,
            message:
                "Visitor approved",
            data: visitor,
        });
    });


export const checkOutVisitor =
    asyncHandler(async (req: Request, res: Response) => {

        const visitor =
            await prisma.visitorEntry.update({
                where: {
                    id: req.params.visitorId as string,
                },

                data: {
                    status: "CHECKED_OUT",

                    checkOutTime:
                        new Date(),
                },
            });

        return res.json({
            success: true,
            message:
                "Visitor checked out",
            data: visitor,
        });
    });


export const getVisitors = asyncHandler(
    async (req: Request, res: Response) => {

        const { propertyId, role } = req.propertyAccess!;
        const userId = req.user!.id;

        const {
            search = "",
            gateId = "ALL",
            hostUserId = "ALL",
            sortOrder = "desc",
        } = req.query;

        const where: Prisma.VisitorEntryWhereInput = {
            propertyId,
        };

        // Restrict non-owner/security users to only their hosted visitors
        if (
            role !== PropertyRole.OWNER &&
            role !== PropertyRole.SECURITY
        ) {
            where.hostUserId = userId;
        }

        // Search
        if (
            typeof search === "string" &&
            search.trim().length > 0
        ) {
            where.OR = [
                {
                    visitorName: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    visitorPhone: {
                        contains: search.trim(),
                    },
                },
                {
                    vehicleNumber: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
                {
                    purpose: {
                        contains: search.trim(),
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Gate filter
        if (
            typeof gateId === "string" &&
            gateId !== "ALL"
        ) {
            where.gateId = gateId;
        }

        // Host filter (only OWNER & SECURITY can filter other users)
        if (
            (role === PropertyRole.OWNER ||
                role === PropertyRole.SECURITY) &&
            typeof hostUserId === "string" &&
            hostUserId !== "ALL"
        ) {
            where.hostUserId = hostUserId;
        }

        let orderBy: Prisma.VisitorEntryOrderByWithRelationInput =
        {
            createdAt: "desc",
        };

        switch (sortOrder) {
            case "asc":
                orderBy = {
                    createdAt: "asc",
                };
                break;

            case "name_asc":
                orderBy = {
                    visitorName: "asc",
                };
                break;

            case "name_desc":
                orderBy = {
                    visitorName: "desc",
                };
                break;

            default:
                orderBy = {
                    createdAt: "desc",
                };
        }

        const visitors = await prisma.visitorEntry.findMany({
            where,

            include: {
                gate: true,

                hostUser: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },

            orderBy,
        });

        return res.json({
            success: true,
            data: visitors,
        });
    }
);