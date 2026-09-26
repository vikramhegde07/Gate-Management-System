import { PropertyRole } from "../generated/prisma";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
                phone?: string;
                type: "access" | "refresh";
                iat?: number;
                exp?: number;
            };

            propertyAccess?: {
                id: string;
                propertyId: string;
                role: PropertyRole;
                designation?: string | null;
            };
        }
    }
}

export { };