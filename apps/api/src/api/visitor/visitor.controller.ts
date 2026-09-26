import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import prisma from "../../lib/prisma";
import { PropertyRole, type Prisma } from "../../generated/prisma/client";

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

        const isSecurity =
            req.propertyAccess?.role ===
            "SECURITY";

        const visitor =
            await prisma.visitorEntry.create({
                data: {
                    propertyId:
                        req.propertyAccess!
                            .propertyId,

                    gateId,

                    visitorName,
                    visitorPhone,

                    purpose,

                    hostUserId,

                    vehicleNumber,
                    vehicleType,

                    remarks,

                    createdById:
                        req.user!.id,

                    status:
                        isSecurity
                            ? "CHECKED_IN"
                            : "PENDING",

                    checkInTime:
                        isSecurity
                            ? new Date()
                            : null,
                },
            });

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