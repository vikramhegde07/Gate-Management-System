import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type TokenDataType = {
    id: string;
    email?: string;
    phone?: string;
};

export const generateTokens = (
    user: TokenDataType
) => {
    const accessToken = jwt.sign(
        {
            ...user,
            type: "access",
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m",
        }
    );

    const refreshToken = jwt.sign(
        {
            ...user,
            type: "refresh",
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    );

    return {
        accessToken,
        refreshToken,
    };
};