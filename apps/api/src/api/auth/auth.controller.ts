import type { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { comparePassword, hashPassword } from "../../utils/password";
import { generateTokens } from "../../utils/jwt";
import { sha256 } from "../../utils/hash";
import { env } from "../../config/env";


export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                email ? { email } : undefined,
                phone ? { phone } : undefined,
            ].filter(Boolean) as any,
        },
    });

    if (existingUser) {
        res.status(409);
        throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            passwordHash,
            isVerified: true,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
        },
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { phone: identifier },
            ],
        },
    });

    if (!user) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    const validPassword = await comparePassword(
        password,
        user.passwordHash
    );

    if (!validPassword) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    const { accessToken, refreshToken } = generateTokens({
        id: user.id,
        email: user.email ?? undefined,
        phone: user.phone ?? undefined,
    });

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: sha256(refreshToken),
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
        },
    });

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
        success: true,
        message: "Login successful",
    });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user!.id,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true,
            createdAt: true,
            profileImage: true
        },
    });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.json({
        success: true,
        data: user,
    });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    const tokenHash = sha256(refreshToken);

    const storedToken =
        await prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                revokedAt: null,
            },
            include: {
                user: true,
            },
        });

    if (!storedToken) {
        res.status(401);
        throw new Error("Refresh token invalid");
    }

    if (storedToken.expiresAt < new Date()) {
        res.status(401);
        throw new Error("Refresh token expired");
    }

    const accessToken = generateTokens({
        id: storedToken.user.id,
        email: storedToken.user.email ?? undefined,
        phone: storedToken.user.phone ?? undefined,
    }).accessToken;

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 15 * 60 * 1000,
    });

    res.json({
        success: true,
        message: "Token refreshed",
    });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await prisma.refreshToken.updateMany({
            where: {
                tokenHash: sha256(refreshToken),
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
        success: true,
        message: "Logged out successfully",
    });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
    await prisma.refreshToken.updateMany({
        where: {
            userId: req.user!.id,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
        success: true,
        message: "Logged out from all devices",
    });
});