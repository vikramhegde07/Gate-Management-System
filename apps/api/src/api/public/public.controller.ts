import type { Request, Response } from "express";

import prisma from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { createNotification, createNotificationRecipients } from "../../utils/notification";
import { getIO } from "../../socket";
import { sendPushNotification } from "../../utils/pushNotification";

export const getPublicProperty =
    asyncHandler(async (req: Request, res: Response) => {

        const { propertyId } = req.params;

        const property =
            await prisma.property.findFirst({
                where: {
                    id: propertyId as string,
                    isActive: true,
                },

                select: {
                    id: true,
                    name: true,
                },
            });

        if (!property) {
            return res.status(404).json({
                success: false,
                message:
                    "Property not found",
            });
        }

        const gates =
            await prisma.gate.findMany({
                where: {
                    propertyId: propertyId as string,
                    isActive: true,
                },

                select: {
                    id: true,
                    name: true,
                },

                orderBy: {
                    name: "asc",
                },
            });

        const hosts =
            await prisma.propertyAccess.findMany({
                where: {
                    propertyId: propertyId as string,
                    isActive: true,
                },

                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },

                orderBy: {
                    user: {
                        name: "asc",
                    },
                },
            });

        return res.json({
            success: true,

            data: {
                property,

                gates,

                hosts: hosts.map(
                    (host) => host.user
                ),
            },
        });
    });


export const createPublicVisitorEntry =
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

        const { propertyId } = req.params;

        const property =
            await prisma.property.findUnique({
                where: {
                    id: propertyId as string,
                },
            });

        if (!property || !property.isActive) {
            return res.status(404).json({
                success: false,
                message: "Property not found",
            });
        }

        const visitor =
            await prisma.visitorEntry.create({
                data: {
                    propertyId: propertyId as string,
                    gateId,
                    visitorName,
                    visitorPhone,
                    purpose,
                    hostUserId,
                    vehicleNumber,
                    vehicleType,
                    remarks,
                    status: "PENDING",
                },
            });

        // Notify security guards currently on duty at this gate.
        try {
            const activeDuties =
                await prisma.gateDuty.findMany({
                    where: {
                        propertyId: propertyId as string,
                        gateId,
                        endedAt: null,
                    },
                    select: {
                        guardUserId: true,
                    },
                    distinct: ["guardUserId"],
                });

            const guardUserIds = [
                ...new Set(
                    activeDuties.map((duty) => duty.guardUserId)
                ),
            ];

            if (guardUserIds.length > 0) {
                // Only notify guards who still have active SECURITY access.
                const activeGuards =
                    await prisma.propertyAccess.findMany({
                        where: {
                            propertyId: propertyId as string,
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
                        activeGuards.map((guard) => guard.userId)
                    ),
                ];

                if (recipientUserIds.length > 0) {
                    const notificationId =
                        await createNotification({
                            propertyId: propertyId as string,
                            type: "VISITOR_APPROVAL_REQUIRED",
                            title: "Visitor approval required",
                            body: `A visitor request from ${visitorName} is waiting for approval.`,
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
                                propertyId: propertyId as string,
                                gateId,
                            },
                        });
                    } catch (error) {
                        console.error("Push notification delivery failed:", error);
                    }
                }
            }
        } catch (error) {
            // Notification failure must not fail visitor submission.
            console.error(
                "Failed to create public visitor notification:",
                error
            );
        }

        // Preserve your existing Socket.IO event.
        getIO()
            .to(`property:${propertyId}:security`)
            .emit("visitor:created");

        return res.status(201).json({
            success: true,
            message: "Visitor request submitted successfully",
            data: {
                id: visitor.id,
            },
        });
    });