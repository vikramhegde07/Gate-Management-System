import type { Request, Response } from "express";

import prisma from "../../lib/prisma";
import { s3Util } from "../../utils/s3-util";
import { asyncHandler } from "../../utils/asyncHandler";
import {
    errorResponse,
    successResponse,
} from "../../utils/response";

// Fields safe to expose to the frontend.
const profileSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    profileImage: true,
    isVerified: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
} as const;

// PATCH /api/v1/profile/me
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

export const updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { name, email, phone } = req.body ?? {};

        const data: {
            name?: string;
            email?: string;
            phone?: string;
            isVerified?: boolean;
        } = {};

        // 1. Validate and prepare name
        if (name !== undefined) {
            if (typeof name !== "string") {
                return errorResponse(res, "Name must be a string", 400);
            }

            const normalizedName = name.trim();

            if (
                normalizedName.length < 2 ||
                normalizedName.length > 100
            ) {
                return errorResponse(
                    res,
                    "Name must be between 2 and 100 characters",
                    400,
                );
            }

            data.name = normalizedName;
        }

        // 2. Validate and prepare email
        if (email !== undefined) {
            if (typeof email !== "string") {
                return errorResponse(res, "Email must be a string", 400);
            }

            const normalizedEmail = email.trim().toLowerCase();

            if (!EMAIL_REGEX.test(normalizedEmail)) {
                return errorResponse(res, "Please provide a valid email address", 400);
            }

            if (normalizedEmail.length > 254) {
                return errorResponse(res, "Email address is too long", 400);
            }

            data.email = normalizedEmail;
        }

        // 3. Validate and prepare phone
        if (phone !== undefined) {
            if (typeof phone !== "string") {
                return errorResponse(res, "Phone must be a string", 400);
            }

            const normalizedPhone = phone.trim();

            if (!PHONE_REGEX.test(normalizedPhone)) {
                return errorResponse(
                    res,
                    "Phone number must contain exactly 10 digits",
                    400,
                );
            }

            data.phone = normalizedPhone;
        }

        // 4. Reject requests with no supported fields
        if (Object.keys(data).length === 0) {
            return errorResponse(
                res,
                "Provide at least one field to update",
                400,
            );
        }

        // 5. Check whether the supplied email or phone belongs
        //    to another account. Exclude the current user.
        const duplicateConditions = [];

        if (data.email !== undefined) {
            duplicateConditions.push({ email: data.email });
        }

        if (data.phone !== undefined) {
            duplicateConditions.push({ phone: data.phone });
        }

        if (duplicateConditions.length > 0) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    id: { not: userId },
                    OR: duplicateConditions,
                },
                select: {
                    email: true,
                    phone: true,
                },
            });

            if (existingUser) {
                if (
                    data.email !== undefined &&
                    existingUser.email === data.email
                ) {
                    return errorResponse(
                        res,
                        "This email address is already in use",
                        409,
                    );
                }

                if (
                    data.phone !== undefined &&
                    existingUser.phone === data.phone
                ) {
                    return errorResponse(
                        res,
                        "This phone number is already in use",
                        409,
                    );
                }

                return errorResponse(
                    res,
                    "Email address or phone number is already in use",
                    409,
                );
            }
        }

        // 6. Invalidate the existing verification state if either
        //    contact detail changes. A verification flow should
        //    verify the updated contact before marking it verified.
        const contactChanged =
            (data.email !== undefined &&
                data.email !==
                (
                    await prisma.user.findUnique({
                        where: { id: userId },
                        select: { email: true },
                    })
                )?.email) ||
            (data.phone !== undefined &&
                data.phone !==
                (
                    await prisma.user.findUnique({
                        where: { id: userId },
                        select: { phone: true },
                    })
                )?.phone);

        if (contactChanged) {
            data.isVerified = false;
        }

        // 7. Update the profile
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data,
                select: profileSelect,
            });

            return successResponse(
                res,
                user,
                "Profile updated successfully",
            );
        } catch (error: unknown) {
            // A concurrent request could claim the value after
            // our duplicate check. Handle the database constraint too.
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "P2002"
            ) {
                return errorResponse(
                    res,
                    "Email address or phone number is already in use",
                    409,
                );
            }

            throw error;
        }
    },
);


// POST /api/v1/profile/me/avatar
export const uploadProfileImage = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const file = req.file;

        if (!file) {
            return errorResponse(
                res,
                "Profile image is required",
                400
            );
        }

        // Basic MIME-type allowlist.
        // This does not independently verify file contents.
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return errorResponse(
                res,
                "Only JPEG, PNG, and WebP images are allowed",
                400
            );
        }

        // Multer also enforces the 5 MB upload limit.
        // Keep this check as defense in depth.
        if (file.size > 5 * 1024 * 1024) {
            return errorResponse(
                res,
                "Profile image must not exceed 5 MB",
                400
            );
        }

        const profileImage = await s3Util.uploadFile(
            file,
            `profile-images/${userId}`
        );

        const user = await prisma.user.update({
            where: { id: userId },
            data: { profileImage },
            select: profileSelect,
        });

        return successResponse(
            res,
            user,
            "Profile image updated successfully"
        );
    }
);

export const checkAvailability = asyncHandler(
    async (req: Request, res: Response) => {
        const rawEmail = req.query.email;
        const rawPhone = req.query.phone;

        // Query parameters must be single strings, not arrays or objects.
        if (
            (rawEmail !== undefined && typeof rawEmail !== "string") ||
            (rawPhone !== undefined && typeof rawPhone !== "string")
        ) {
            return errorResponse(
                res,
                "Email and phone must be single values",
                400,
            );
        }

        if (rawEmail === undefined && rawPhone === undefined) {
            return errorResponse(
                res,
                "Provide an email, phone, or both",
                400,
            );
        }

        const email =
            typeof rawEmail === "string"
                ? rawEmail.trim().toLowerCase()
                : undefined;

        const phone =
            typeof rawPhone === "string"
                ? rawPhone.trim()
                : undefined;

        // Validate provided fields before querying the database.
        if (email !== undefined) {
            if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
                return errorResponse(res, "Please provide a valid email address", 400);
            }
        }

        if (phone !== undefined) {
            if (!PHONE_REGEX.test(phone)) {
                return errorResponse(
                    res,
                    "Phone number must contain exactly 10 digits",
                    400,
                );
            }
        }

        const conditions = [];

        if (email !== undefined) {
            conditions.push({
                email: {
                    equals: email,
                    mode: "insensitive" as const,
                },
            });
        }

        if (phone !== undefined) {
            conditions.push({ phone });
        }

        const existingUsers = await prisma.user.findMany({
            where: {
                ...(req.user?.id ? { id: { not: req.user.id } } : {}),
                OR: conditions,
            },
            select: {
                email: true,
                phone: true,
            },
        });

        const emailAvailable =
            email === undefined
                ? undefined
                : !existingUsers.some(
                    (user) => user.email.toLowerCase() === email,
                );

        const phoneAvailable =
            phone === undefined
                ? undefined
                : !existingUsers.some(
                    (user) => user.phone === phone,
                );

        return successResponse(
            res,
            {
                ...(emailAvailable !== undefined
                    ? { email: { value: email, available: emailAvailable } }
                    : {}),
                ...(phoneAvailable !== undefined
                    ? { phone: { value: phone, available: phoneAvailable } }
                    : {}),
            },
            "Availability checked successfully",
        );
    },
);
