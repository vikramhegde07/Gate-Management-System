import type { PropertyRole } from "./property";

export type VisitorEntryType = "MANUAL" | "PRE_APPROVED" | "QR" | "SELF_REGISTERED";

export type VisitorEntryStatus = "PENDING" | "CHECKED_IN" | "CHECKED_OUT" | "REJECTED" | "CANCELLED";

export interface Property {
    id: string;
    name: string;
    type?: string;
    code?: string;
}

export interface Gate {
    id: string;
    name: string;
    code?: string;
    description?: string;
}

export interface NestedUser {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
}

// Map the backend data structure when fetching user rosters for a property
export interface HostUser {
    role: PropertyRole;
    designation: string | null;
    user: NestedUser;
}

export interface Visitor {
    id: string;
    propertyId: string;
    property?: Property;

    gateId: string;
    gate?: Gate;

    visitorName: string;
    visitorPhone: string | null;
    visitorPhotoUrl: string | null;
    purpose: string | null;

    hostUserId: string | null;
    hostUser?: NestedUser;

    entryType: VisitorEntryType;
    status: VisitorEntryStatus;

    // Vehicle Details
    vehicleNumber: string | null;
    vehicleType: string | null;

    // Timestamps
    checkInTime: string | null;   // ISO string from API
    checkOutTime: string | null;  // ISO string from API
    createdAt: string;            // ISO string from API
    updatedAt: string;            // ISO string from API

    // Audit Nodes
    createdById: string | null;
    createdBy?: NestedUser;

    approvedById: string | null;
    approvedBy?: NestedUser;

    remarks: string | null;
}