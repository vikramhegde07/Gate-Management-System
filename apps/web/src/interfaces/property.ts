export type PropertyRole = "OWNER" | "COMMITTEE" | "RESIDENT" | "SECURITY" | "STAFF";

export type PropertyType =
    | "PG"
    | "APARTMENT"
    | "OFFICE"
    | "WAREHOUSE"
    | "FACTORY"
    | "SCHOOL"
    | "OTHER";

export interface PropertyAccess {
    id: string;
    userId: string;
    propertyId: string;
    role: PropertyRole;
    designation: string | null; // Optional title (e.g., "Block A Manager" or "Main Gate Guard")
    isActive: boolean;
    joinedAt: string;
    createdAt: string;
    updatedAt: string;

    // Optional relations included in nested API payloads
    property?: Property;
}

export interface Property {
    id: string;
    name: string;
    type: PropertyType;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    country: string;
    postalCode: string | null;
    latitude: number | null;  // Converted from Decimal for client-side consumption
    longitude: number | null; // Converted from Decimal for client-side consumption
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    // Optional relations populated by specific endpoints
    accessUsers?: PropertyAccess[];
}

/**
 * UI Specific Type: Useful for a user's initial dashboard 
 * when listing all properties they have access to.
 */
export interface UserPropertyMembership {
    id: string; // PropertyAccess ID
    role: PropertyRole;
    designation: string | null;
    isActive: boolean;
    property: Property;
}