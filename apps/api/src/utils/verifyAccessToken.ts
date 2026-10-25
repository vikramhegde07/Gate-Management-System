
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { JWTPayload } from "../middlewares/authMiddleware";

export const verifyAccessToken = (token: string): JWTPayload => {
    const decoded = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET
    ) as JWTPayload;

    if (decoded.type !== "access") {
        throw new Error("Invalid token type");
    }

    return decoded;
};
