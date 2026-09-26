import type { Request, Response } from "express";

import prisma from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

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
                message:
                    "Property not found",
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

        return res.status(201).json({
            success: true,
            message:
                "Visitor request submitted successfully",
            data: {
                id: visitor.id,
            },
        });
    });