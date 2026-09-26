import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/shared/AppSidebar";
import TopNavbar from "@/components/shared/TopNavbar";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ProtectedLayout: The main shell of the application after logging in.
 * Includes the Sidebar, Top Navigation, and the Content Area.
 */
const ProtectedLayout = () => {
    // mobileOpen controls the sidebar visibility on small screens
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation()

    return (
        <div className="flex min-h-screen bg-background">
            {/* APP SIDEBAR 
                Passes state to handle mobile responsiveness
            */}
            <AppSidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* MAIN CONTENT AREA
                The 'flex-1' ensures it takes up the remaining width next to the sidebar
            */}
            <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
                {/* TOP NAVBAR 
                    Contains breadcrumbs, User Profile, and Mobile Toggle
                */}
                <TopNavbar
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />

                {/* SCROLLABLE CONTENT WINDOW
                    We use Framer Motion here to animate page transitions 
                    every time the Route changes.
                */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mx-auto w-full max-w-7xl"
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>

            {/* MOBILE OVERLAY 
                Dimmed background when sidebar is open on mobile
            */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProtectedLayout;