import { Mail, Smartphone, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PropertyUser {
    role: string;
    designation: string | null;
    user: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        isActive: boolean;
    };
}

export function UserCard({ member }: { member: PropertyUser }) {
    const getRoleStyles = (role: string) => {
        switch (role) {
            case "OWNER":
            case "COMMITTEE":
                return "bg-primary text-primary-foreground font-semibold";
            case "SECURITY":
                return "bg-destructive/10 text-destructive border-destructive/20 font-medium";
            default:
                return "bg-secondary text-secondary-foreground font-medium";
        }
    };

    return (
        <Card className="border border-border/80 shadow-sm hover:shadow-md transition-all duration-200 bg-card overflow-hidden group">
            <CardContent className="p-5 space-y-4">
                {/* Upper Frame */}
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {member.user.name}
                        </h3>
                        {member.designation && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Briefcase className="h-3 w-3 inline" />
                                {member.designation}
                            </p>
                        )}
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleStyles(member.role)}`}>
                        {member.role}
                    </span>
                </div>

                <hr className="border-border/60" />

                {/* Communication Channels */}
                <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{member.user.email || "No Email Bound"}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        <span>{member.user.phone || "No Operational Line"}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}