import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProperty } from "@/context/PropertyContext";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

/**
 * PropertyGuard ensures that internal, tenant-specific routes
 * cannot be opened unless an active property context is loaded.
 */
const PropertyGuard = () => {
    const { currentProperty, loading } = useProperty();
    const location = useLocation();

    // While refreshing membership or rehydrating local storage selection
    if (loading) {
        return (
            <div className="relative min-h-screen w-full bg-background">
                <LoadingOverlay
                    isLoading={true}
                    variant="fullscreen"
                    message="Verifying property credentials..."
                />
            </div>
        );
    }

    // No property has been loaded yet -> bounce them to the selection page
    if (!currentProperty) {
        // We preserve their intended path in state so we can redirect them back 
        // right after they click on a property profile card.
        return <Navigate to="/properties" state={{ from: location }} replace />;
    }

    // Property successfully established. Render ProtectedLayout.
    return <Outlet />;
};

export default PropertyGuard;