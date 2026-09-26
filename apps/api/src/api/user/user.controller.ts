import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import prisma from "../../lib/prisma";
import { hashPassword } from "../../utils/password";

export const createPropertyUser =
    asyncHandler(async (req: Request, res: Response) => {

        const {
            name,
            email,
            phone,
            password,

            role,
            designation,
        } = req.body;

        const existingUser =
            await prisma.user.findFirst({
                where: {
                    OR: [
                        email
                            ? { email }
                            : undefined,

                        phone
                            ? { phone }
                            : undefined,
                    ].filter(Boolean) as any,
                },
            });

        let userId: string;

        if (existingUser) {
            userId = existingUser.id;
        } else {

            const passwordHash =
                await hashPassword(password);

            const user =
                await prisma.user.create({
                    data: {
                        name,
                        email,
                        phone,

                        passwordHash,

                        isVerified: true,
                    },
                });

            userId = user.id;
        }

        const existingAccess =
            await prisma.propertyAccess.findFirst({
                where: {
                    propertyId:
                        req.propertyAccess!
                            .propertyId,

                    userId,
                },
            });

        if (existingAccess) {
            return res.status(409).json({
                success: false,
                message:
                    "User already belongs to this property",
            });
        }

        await prisma.propertyAccess.create({
            data: {
                userId,

                propertyId:
                    req.propertyAccess!
                        .propertyId,

                role,
                designation,
            },
        });

        return res.status(201).json({
            success: true,
            message:
                "User added successfully",
        });
    });

export const getPropertyUsers = asyncHandler(async (req: Request, res: Response) => {

    const users =
        await prisma.propertyAccess.findMany({
            where: {
                propertyId:
                    req.propertyAccess!
                        .propertyId,

                isActive: true,
            },

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        isActive: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

    return res.json({
        success: true,
        data: users,
    });
});