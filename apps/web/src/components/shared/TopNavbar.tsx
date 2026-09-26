import { Bell, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TopNavbarProps {
    mobileOpen: boolean;
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TopNavbar({
    mobileOpen,
    setMobileOpen,
}: TopNavbarProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
            {/* LEFT SECTION */}
            <div className="flex items-center gap-3">
                {/* MOBILE MENU BUTTON */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() =>
                        setMobileOpen(!mobileOpen)
                    }
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* MOBILE PRODUCT NAME */}
                <div className="lg:hidden">
                    <h1 className="font-semibold">
                        Gate Entry
                    </h1>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                >
                    <Bell className="h-5 w-5" />

                    {/* Notification Dot */}
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </Button>
            </div>
        </header>
    );
}