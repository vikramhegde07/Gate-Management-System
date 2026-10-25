
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

import { verifyAccessToken } from "../utils/verifyAccessToken";
import prisma from "../lib/prisma";

const allowedOrigins = [
    "http://localhost:5173",
    "https://gate-management-system-beryl.vercel.app"
];

const allowedSecurityRoles = ["OWNER", "COMMITTEE", "SECURITY"] as const;

type SocketUser = {
    id: string;
    email?: string;
    phone?: string;
};

type JoinRoomAck = (result: {
    success: boolean;
    message: string;
}) => void;

const getCookie = (
    cookieHeader: string | undefined,
    name: string
): string | undefined => {
    if (!cookieHeader) return undefined;

    const cookie = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    if (!cookie) return undefined;

    try {
        return decodeURIComponent(cookie.slice(name.length + 1));
    } catch {
        return undefined;
    }
};

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ["GET", "POST"],
        },
    });

    // Authenticate the connection using the existing HTTP-only cookie.
    io.use((socket, next) => {
        try {
            const token = getCookie(
                socket.handshake.headers.cookie,
                "accessToken"
            );

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const payload = verifyAccessToken(token);

            socket.data.user = {
                id: payload.id,
                ...(payload.email !== undefined && { email: payload.email }),
                ...(payload.phone !== undefined && { phone: payload.phone }),
            } satisfies SocketUser;

            next();
        } catch {
            next(new Error("Invalid or expired access token"));
        }
    });

    io.on("connection", (socket) => {
        const user = socket.data.user as SocketUser;

        console.log(`Authenticated socket connected: ${socket.id}`);

        socket.on(
            "property:join-security-room",
            async (propertyId: unknown, ack?: JoinRoomAck) => {
                if (
                    typeof propertyId !== "string" ||
                    propertyId.trim().length === 0 ||
                    propertyId.length > 100
                ) {
                    ack?.({
                        success: false,
                        message: "Invalid property ID",
                    });
                    return;
                }

                try {
                    const access = await prisma.propertyAccess.findFirst({
                        where: {
                            userId: user.id,
                            propertyId,
                            isActive: true,
                            role: {
                                in: [...allowedSecurityRoles],
                            },
                        },
                        select: {
                            id: true,
                        },
                    });

                    if (!access) {
                        ack?.({
                            success: false,
                            message: "You do not have access to this property's security events",
                        });
                        return;
                    }

                    await socket.join(
                        `property:${propertyId}:security`
                    );

                    ack?.({
                        success: true,
                        message: "Joined property security room",
                    });
                } catch (error) {
                    console.error("Failed to join security room:", error);

                    ack?.({
                        success: false,
                        message: "Unable to join security room",
                    });
                }
            }
        );

        socket.on("disconnect", (reason) => {
            console.log(`Socket disconnected: ${socket.id}`, reason);
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized. Call initSocket(server) first."
        );
    }

    return io;
};
