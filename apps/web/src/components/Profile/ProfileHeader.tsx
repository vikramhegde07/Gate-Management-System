import { UserRound, ChevronRight } from "lucide-react";

export function ProfileHeader() {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserRound className="h-4 w-4" />
                <span>Account</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">My Profile</span>
            </div>

            <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    My Profile
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Manage your personal information and account preferences.
                </p>
            </div>
        </div>
    );
}