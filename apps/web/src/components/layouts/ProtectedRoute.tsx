import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"; // Adjust path as needed

/**
 * ProtectedRoute: Higher-order component that prevents 
 * unauthenticated users from accessing internal routes.
 */
const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // While checking session, show a clean, branded loading state
    if (loading) {
        return (
            <div className="relative min-h-screen w-full bg-background">
                <LoadingOverlay
                    isLoading={true}
                    variant="fullscreen"
                    message="Authenticating session..."
                />
            </div>
        );
    }

    // Redirect to login if user is not found after loading
    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    // Render the nested routes (Dashboard, PGs, etc.)
    return <Outlet />;
};

export default ProtectedRoute;