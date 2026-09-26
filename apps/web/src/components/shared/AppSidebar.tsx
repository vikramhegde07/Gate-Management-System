import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LogOut,
    User,
    LayoutDashboard,
    DoorOpen,
    Users,
    ShieldCheck,
    ArrowLeft,
    UserCheck
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useProperty } from "@/context/PropertyContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
    mobileOpen: boolean;
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Master Navigation Definition
const navItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        allowedRoles: ["OWNER", "COMMITTEE", "RESIDENT", "SECURITY", "STAFF"],
    },
    {
        label: "Visitors Logs",
        icon: Users,
        href: "/visitors",
        allowedRoles: ["OWNER", "COMMITTEE", "RESIDENT", "SECURITY", "STAFF"],
    },
    {
        label: "Gates Config",
        icon: DoorOpen,
        href: "/gates",
        allowedRoles: ["OWNER", "COMMITTEE"],
    },
    {
        label: "User Directory",
        icon: UserCheck,
        href: "/users",
        allowedRoles: ["OWNER", "COMMITTEE"],
    },
];

export default function AppSidebar({ mobileOpen, setMobileOpen }: AppSidebarProps) {
    const { logout } = useAuth();
    const { currentProperty, currentRole, clearSelectedProperty } = useProperty();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout runtime failure, hitting reload:", error);
            window.location.href = "/auth/login";
        }
    };

    const handleSwitchWorkspace = () => {
        clearSelectedProperty();
        setMobileOpen(false);
        navigate("/properties", { replace: true });
    };

    // Filter core links strictly based on current authenticated role context
    const visibleNavigation = navItems.filter(item =>
        currentRole && item.allowedRoles.includes(currentRole)
    );

    const sidebarContent = (
        <div className="flex h-full flex-col justify-between bg-sidebar text-sidebar-foreground select-none">
            {/* TOP WING */}
            <div>
                {/* IDENTITY COMPARTMENT */}
                <div className="border-b border-sidebar-border px-5 py-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 bg-primary text-primary-foreground rounded flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="text-sm font-bold tracking-tight truncate leading-none">
                                {currentProperty?.name || "GatePass Workspace"}
                            </h1>
                            <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                                Role: {currentRole || "Guest"}
                            </span>
                        </div>
                    </div>

                    {/* SWITCH WORKSPACE ACCELERATOR */}
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs gap-2 h-8 font-medium justify-center bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-all border border-sidebar-border/60"
                        onClick={handleSwitchWorkspace}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Switch Workspace</span>
                    </Button>
                </div>

                {/* DYNAMIC NAVIGATION LINKS */}
                <div className="px-3 py-2">
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        Operational Core
                    </p>
                    <nav className="space-y-1 mt-1">
                        {visibleNavigation.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={cn(
                                            "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                                            isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground/80 group-hover:text-sidebar-accent-foreground"
                                        )} />
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>

            {/* BOTTOM ACCOUNT UTILITIES */}
            <div className="border-t border-sidebar-border p-3 bg-muted/10 space-y-1">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-9 font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => {
                        navigate("/profile");
                        setMobileOpen(false);
                    }}
                >
                    <User className="mr-2.5 h-4 w-4 text-muted-foreground" />
                    My Profile
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-9 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2.5 h-4 w-4" />
                    Terminate Session
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* DESKTOP MOUNT BLOCK */}
            <aside className="hidden h-screen w-64 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col shrink-0">
                {sidebarContent}
            </aside>

            {/* MOBILE DRAWER PORTAL */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Dim Backdrop Layer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-40 bg-black lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-sidebar-border bg-sidebar shadow-2xl lg:hidden"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}