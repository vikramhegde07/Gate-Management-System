
import type { Request, Response } from "express";
import { PropertyRole, GateDutyEndType } from "../../generated/prisma/enums";
import prisma from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { Prisma } from "../../generated/prisma/client";

export const startDuty = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const propertyId = req.params.propertyId as string;
        const { gateId } = req.body as { gateId?: string };

        if (!gateId || typeof gateId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Gate ID is required.",
            });
        }

        // Confirm that the guard has active SECURITY access.
        const access = await prisma.propertyAccess.findFirst({
            where: {
                userId,
                propertyId,
                role: PropertyRole.SECURITY,
                isActive: true,
            },
        });

        if (!access) {
            return res.status(403).json({
                success: false,
                message: "Active security access is required to start duty.",
            });
        }

        // Ensure the selected gate belongs to this property and is active.
        const gate = await prisma.gate.findFirst({
            where: {
                id: gateId,
                propertyId,
                isActive: true,
            },
            select: { id: true },
        });

        if (!gate) {
            return res.status(404).json({
                success: false,
                message: "Active gate not found in this property.",
            });
        }

        // Fast feedback; the database unique index handles concurrent requests.
        const existingDuty = await prisma.gateDuty.findFirst({
            where: {
                propertyId,
                guardUserId: userId,
                endedAt: null,
            },
            include: {
                gate: { select: { id: true, name: true } },
            },
        });

        if (existingDuty) {
            return res.status(409).json({
                success: false,
                message: "You already have an active duty assignment.",
                data: existingDuty,
            });
        }

        try {
            const duty = await prisma.gateDuty.create({
                data: {
                    propertyId,
                    gateId,
                    guardUserId: userId,
                    startedByUserId: userId,
                },
                include: {
                    gate: { select: { id: true, name: true } },
                },
            });

            return res.status(201).json({
                success: true,
                message: "Duty started successfully.",
                data: duty,
            });
        } catch (error) {
            // The partial unique index is the final concurrency safeguard.
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                return res.status(409).json({
                    success: false,
                    message: "You already have an active duty assignment.",
                });
            }

            throw error;
        }
    }
);

export const endDuty = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const propertyId = req.params.propertyId as string;

        const activeDuty = await prisma.gateDuty.findFirst({
            where: {
                propertyId,
                guardUserId: userId,
                endedAt: null,
            },
        });

        if (!activeDuty) {
            return res.status(404).json({
                success: false,
                message: "You do not have an active duty assignment.",
            });
        }

        // Conditional update prevents two concurrent requests from ending
        // the same duty twice.
        const result = await prisma.gateDuty.updateMany({
            where: {
                id: activeDuty.id,
                guardUserId: userId,
                propertyId,
                endedAt: null,
            },
            data: {
                endedAt: new Date(),
                endedByUserId: userId,
                endType: GateDutyEndType.GUARD_CHECKOUT,
                endReason: null,
            },
        });

        if (result.count === 0) {
            return res.status(409).json({
                success: false,
                message: "This duty has already ended or changed.",
            });
        }

        const duty = await prisma.gateDuty.findUnique({
            where: { id: activeDuty.id },
            include: {
                gate: { select: { id: true, name: true } },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Duty ended successfully.",
            data: duty,
        });
    }
);

export const getCurrentDuty = asyncHandler(
    async (req: Request, res: Response) => {
        const propertyId = req.params.propertyId as string;

        const duties = await prisma.gateDuty.findMany({
            where: {
                propertyId,
                endedAt: null,
            },
            include: {
                gate: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                guardUser: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                startedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                startedAt: "asc",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Current duty assignments retrieved successfully.",
            data: duties,
        });
    }
);

export const correctDuty = asyncHandler(
    async (req: Request, res: Response) => {
        const actorUserId = req.user!.id;
        const propertyId = req.params.propertyId as string;
        const dutyId = req.params.dutyId as string;
        const { reason } = req.body as { reason?: string };

        if (typeof reason !== "string" || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "A reason is required to correct a duty record.",
            });
        }

        // Revalidate the administrator's active property access.
        const access = await prisma.propertyAccess.findFirst({
            where: {
                userId: actorUserId,
                propertyId,
                role: {
                    in: [PropertyRole.OWNER, PropertyRole.COMMITTEE],
                },
                isActive: true,
            },
            select: { id: true },
        });

        if (!access) {
            return res.status(403).json({
                success: false,
                message: "Active owner or committee access is required.",
            });
        }

        const activeDuty = await prisma.gateDuty.findFirst({
            where: {
                id: dutyId,
                propertyId,
                endedAt: null,
            },
        });

        if (!activeDuty) {
            return res.status(404).json({
                success: false,
                message: "Active duty assignment not found.",
            });
        }

        const result = await prisma.gateDuty.updateMany({
            where: {
                id: dutyId,
                propertyId,
                endedAt: null,
            },
            data: {
                endedAt: new Date(),
                endedByUserId: actorUserId,
                endType: GateDutyEndType.ADMIN_CORRECTION,
                endReason: reason.trim(),
            },
        });

        if (result.count === 0) {
            return res.status(409).json({
                success: false,
                message: "This duty has already ended or changed.",
            });
        }

        const duty = await prisma.gateDuty.findUnique({
            where: { id: dutyId },
            include: {
                gate: { select: { id: true, name: true } },
                guardUser: { select: { id: true, name: true } },
                endedBy: { select: { id: true, name: true } },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Duty record corrected successfully.",
            data: duty,
        });
    }
);
