import type { Request, Response } from "express";

import prisma from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

export const createProperty = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            code,
            type,

            addressLine1,
            addressLine2,

            city,
            state,
            country,

            postalCode,
            latitude,
            longitude,
        } = req.body;

        const property = await prisma.$transaction(
            async (tx) => {
                const newProperty =
                    await tx.property.create({
                        data: {
                            name,
                            type,

                            addressLine1,
                            addressLine2,

                            city,
                            state,
                            country,

                            postalCode,

                            latitude,
                            longitude,
                        },
                    });

                await tx.propertyAccess.create({
                    data: {
                        userId: req.user!.id,
                        propertyId: newProperty.id,

                        role: "OWNER",
                    },
                });

                return newProperty;
            }
        );

        return res.status(201).json({
            success: true,
            message:
                "Property created successfully",
            data: property,
        });
    }
);

export const getProperties = asyncHandler(
    async (req: Request, res: Response) => {
        const properties =
            await prisma.propertyAccess.findMany({
                where: {
                    userId: req.user!.id,
                    isActive: true,
                },

                include: {
                    property: true,
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        return res.json({
            success: true,
            data: properties,
        });
    }
);

export const getProperty = asyncHandler(
    async (req: Request, res: Response) => {
        const property =
            await prisma.property.findUnique({
                where: {
                    id: req.params.propertyId as string,
                },
            });

        if (!property) {
            return res.status(404).json({
                success: false,
                message:
                    "Property not found",
            });
        }

        return res.json({
            success: true,
            data: property,
        });
    }
);

export const updateProperty = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            type,

            addressLine1,
            addressLine2,

            city,
            state,
            country,

            postalCode,
            latitude,
            longitude,

            isActive,
        } = req.body;

        const property =
            await prisma.property.update({
                where: {
                    id: req.params.propertyId as string,
                },

                data: {
                    name,
                    type,

                    addressLine1,
                    addressLine2,

                    city,
                    state,
                    country,

                    postalCode,

                    latitude,
                    longitude,

                    isActive,
                },
            });

        return res.json({
            success: true,
            message:
                "Property updated successfully",
            data: property,
        });
    }
);