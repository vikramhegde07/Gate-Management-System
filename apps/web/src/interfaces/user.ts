// src/interfaces/user.ts

export interface UserType {
    id: string;
    name: string;

    email: string | null;
    phone: string | null;

    profileImage: string | null;

    isVerified: boolean;
    isActive: boolean;

    createdAt: string;
}