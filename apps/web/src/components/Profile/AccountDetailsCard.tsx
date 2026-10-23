import { Fingerprint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UserType } from "@/interfaces/user";

interface AccountDetailsCardProps {
    user: UserType | null;
    memberSince: string;
}

export function AccountDetailsCard({ user, memberSince }: AccountDetailsCardProps) {
    return (
        <Card className="border-border/70 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Fingerprint className="h-5 w-5 text-emerald-600" />
                    Account details
                </CardTitle>
                <CardDescription>
                    An overview of your account.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                        Account status
                    </span>
                    <Badge
                        variant="outline"
                        className={
                            user?.isActive
                                ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                                : ""
                        }
                    >
                        {user?.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>

                <Separator />

                <div className="flex items-start justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                        Verification
                    </span>
                    <span className="text-sm font-medium">
                        {user?.isVerified ? "Verified" : "Pending"}
                    </span>
                </div>

                <Separator />

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        Member since
                    </p>
                    <p className="text-sm font-medium">{memberSince}</p>
                </div>
            </CardContent>
        </Card>
    );
}