import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { verifyAccessToken } from "../utils/verifyAccessToken";

export interface JWTPayload {
    id: string;
    email?: string;
    phone?: string;
    type: "access" | "refresh";
    iat?: number;
    exp?: number;
}

export const verifyJWT = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token missing",
            });
        }

        req.user = verifyAccessToken(token);

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
    }
};

export const verifyRefresh = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token missing",
            });
        }

        const decoded = jwt.verify(
            token,
            env.JWT_REFRESH_SECRET
        ) as JWTPayload;

        if (decoded.type !== "refresh") {
            return res.status(401).json({
                success: false,
                message: "Invalid token type",
            });
        }

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};