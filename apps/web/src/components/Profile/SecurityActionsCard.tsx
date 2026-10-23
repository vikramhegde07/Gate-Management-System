import { ChevronRight, CircleHelp, KeyRound, LoaderCircle, LogOut, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SecurityActionsCardProps {
    isSigningOut: boolean;
    onSignOut: () => void;
}

export function SecurityActionsCard({ isSigningOut, onSignOut }: SecurityActionsCardProps) {
    return (
        <Card className="border-border/70 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <KeyRound className="h-5 w-5 text-emerald-600" />
                    Security & account
                </CardTitle>
                <CardDescription>
                    Manage access to your account.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3 opacity-60">
                    <span className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Security settings</span>
                    </span>
                    <Badge variant="secondary">Coming soon</Badge>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3 opacity-60">
                    <span className="flex items-center gap-3">
                        <CircleHelp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Help & support</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <Separator className="my-4" />

                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                    onClick={onSignOut}
                    disabled={isSigningOut}
                >
                    {isSigningOut ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="h-4 w-4" />
                    )}
                    {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
            </CardContent>
        </Card>
    );
}