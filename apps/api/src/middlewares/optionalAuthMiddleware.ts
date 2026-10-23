
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import type { JWTPayload } from "./authMiddleware";

export const optionalVerifyJWT = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.cookies?.accessToken;

        // No token is fine for this public endpoint.
        if (!token) return next();

        const decoded = jwt.verify(
            token,
            env.JWT_ACCESS_SECRET,
        ) as JWTPayload;

        if (decoded.type === "access") {
            req.user = decoded;
        }
    } catch {
        // An invalid or expired token does not block a public check.
        // It simply means we cannot exclude a current user.
    }

    return next();
};
