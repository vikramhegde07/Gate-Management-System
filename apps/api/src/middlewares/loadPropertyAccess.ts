import type {
    Request,
    Response,
    NextFunction,
} from "express";

import prisma from "../lib/prisma";

export const loadPropertyAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { propertyId } = req.params;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "Property ID is required",
            });
        }

        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const access =
            await prisma.propertyAccess.findFirst({
                where: {
                    propertyId: propertyId as string,
                    userId: req.user.id,
                    isActive: true,
                },
            });

        if (!access) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have access to this property",
            });
        }

        req.propertyAccess = {
            id: access.id,
            propertyId: access.propertyId,
            role: access.role,
            designation: access.designation,
        };

        next();
    } catch (error) {
        next(error);
    }
};