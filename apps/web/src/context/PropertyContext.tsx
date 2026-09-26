import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { apiPrivate } from "@/lib/api";
import { useAuth } from "./AuthContext";
import type { Property, PropertyRole, UserPropertyMembership } from "@/interfaces/property";

interface PropertyContextType {
    memberships: UserPropertyMembership[];
    currentProperty: Property | null;
    currentRole: PropertyRole | null;
    loading: boolean;
    selectProperty: (propertyId: string) => void;
    clearSelectedProperty: () => void;
    refreshMemberships: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const { user } = useAuth();
    const [memberships, setMemberships] = useState<UserPropertyMembership[]>([]);
    const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
    const [currentRole, setCurrentRole] = useState<PropertyRole | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshMemberships = async () => {
        if (!user) return;
        try {
            setLoading(true);
            // Assuming your backend endpoint maps to GET /properties/memberships
            const res = await apiPrivate.get("/properties");
            const userMemberships: UserPropertyMembership[] = res.data.data;
            setMemberships(userMemberships);

            // Rehydrate selection from localStorage if it matches an active membership
            const savedPropertyId = localStorage.getItem("selected_property_id");
            if (savedPropertyId) {
                const active = userMemberships.find(m => m.property.id === savedPropertyId && m.isActive);
                if (active) {
                    setCurrentProperty(active.property);
                    setCurrentRole(active.role);
                } else {
                    clearSelectedProperty();
                }
            }
        } catch (err) {
            console.error("Failed to fetch property memberships", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch memberships automatically when user logs in
    useEffect(() => {
        console.log("PropertyContext: User dependency changed. Current value:", user);

        if (user && Object.keys(user).length > 0) {
            console.log("PropertyContext: Authenticated state detected -> fetching memberships.");
            refreshMemberships();
        } else {
            console.log("PropertyContext: Unauthenticated state triggered -> clearing workspace contexts.");
            setMemberships([]);
            setCurrentProperty(null);
            setCurrentRole(null);
            setLoading(false);

            localStorage.removeItem("selected_property_id");
        }
    }, [user]);

    const selectProperty = (propertyId: string) => {
        const active = memberships.find(m => m.property.id === propertyId && m.isActive);
        if (active) {
            setCurrentProperty(active.property);
            setCurrentRole(active.role);
            localStorage.setItem("selected_property_id", propertyId);
        }
    };

    const clearSelectedProperty = () => {
        setCurrentProperty(null);
        setCurrentRole(null);
        localStorage.removeItem("selected_property_id");
    };

    return (
        <PropertyContext.Provider
            value={{
                memberships,
                currentProperty,
                currentRole,
                loading,
                selectProperty,
                clearSelectedProperty,
                refreshMemberships,
            }}
        >
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperty = () => {
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error("useProperty must be used within a PropertyProvider");
    }
    return context;
};