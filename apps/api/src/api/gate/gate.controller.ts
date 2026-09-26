import type { Request, Response } from "express";

import prisma from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";

export const createGate = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            code,
            description,
        } = req.body;

        const existingGate =
            await prisma.gate.findFirst({
                where: {
                    propertyId:
                        req.propertyAccess!.propertyId,

                    name,
                },
            });

        if (existingGate) {
            return res.status(409).json({
                success: false,
                message:
                    "Gate with this name already exists",
            });
        }

        const gate = await prisma.gate.create({
            data: {
                propertyId: req.propertyAccess!.propertyId,
                name,
                code,
                description,
            },
        });

        return res.status(201).json({
            success: true,
            message:
                "Gate created successfully",
            data: gate,
        });
    }
);

export const getGates = asyncHandler(
    async (req: Request, res: Response) => {
        const gates =
            await prisma.gate.findMany({
                where: {
                    propertyId:
                        req.propertyAccess!.propertyId,

                    isActive: true,
                },

                orderBy: {
                    createdAt: "asc",
                },
            });

        return res.json({
            success: true,
            data: gates,
        });
    }
);