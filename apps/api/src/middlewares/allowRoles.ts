import type {
    Request,
    Response,
    NextFunction,
} from "express";

import type { PropertyRole } from "../generated/prisma/client";

export const allowRoles =
    (roles: PropertyRole[]) =>
        (
            req: Request,
            res: Response,
            next: NextFunction
        ) => {

            if (!req.propertyAccess) {
                return res.status(403).json({
                    success: false,
                    message: "Property access not loaded",
                });
            }

            if (
                !roles.includes(
                    req.propertyAccess.role
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Insufficient permissions",
                });
            }

            next();
        };