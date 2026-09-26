import { useEffect, useState } from "react";
import { Users, Shield, ShieldAlert, Building } from "lucide-react";

import apiPrivate from "@/lib/api";
import { useProperty } from "@/context/PropertyContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "@/components/user/UserCard";
import { AddUserModal } from "@/components/user/AddUserModal";

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

export default function UsersPage() {
    const { currentProperty } = useProperty();
    const [users, setUsers] = useState<PropertyUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkspaceUsers = async () => {
        if (!currentProperty) return;
        try {
            setLoading(true);
            const res = await apiPrivate.get(`/properties/${currentProperty.id}/users`);
            setUsers(res.data.data || []);
        } catch (err) {
            console.error("Failed retrieving secure group list:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaceUsers();
    }, [currentProperty]);

    const handleCreateUser = async (formData: any) => {
        if (!currentProperty) return;
        await apiPrivate.post(`/properties/${currentProperty.id}/users`, formData);
        await fetchWorkspaceUsers();
    };

    // Group users strictly into operational buckets
    const managementTeam = users.filter(u => u.role === "OWNER" || u.role === "COMMITTEE");
    const securityForce = users.filter(u => u.role === "SECURITY");
    const residentsAndStaff = users.filter(u => u.role === "RESIDENT" || u.role === "STAFF");

    return (
        <div className="space-y-6">
            {/* Header Desk */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <span>User Directory</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage roles, access tags, and personnel nodes for <span className="font-semibold text-foreground">{currentProperty?.name}</span>
                    </p>
                </div>

                {currentProperty && <AddUserModal onUserCreated={handleCreateUser} />}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <p className="text-xs font-medium animate-pulse mt-1">Decrypting personnel roster records...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-12 text-center max-w-md mx-auto my-10 space-y-3">
                    <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto stroke-[1.5]" />
                    <h3 className="font-bold text-lg text-foreground">Isolated Workspace Detected</h3>
                    <p className="text-sm text-muted-foreground">
                        No active users or operational personnel profiles are registered to this infrastructure partition yet.
                    </p>
                </div>
            ) : (
                <Tabs defaultValue="security" className="space-y-6">
                    <TabsList className="bg-muted/60 p-1 border border-border/50 h-10">
                        <TabsTrigger value="security" className="text-xs font-medium gap-2 px-4">
                            <Shield className="h-3.5 w-3.5" />
                            Security Force ({securityForce.length})
                        </TabsTrigger>
                        <TabsTrigger value="management" className="text-xs font-medium gap-2 px-4">
                            <Building className="h-3.5 w-3.5" />
                            Management ({managementTeam.length})
                        </TabsTrigger>
                        <TabsTrigger value="residents" className="text-xs font-medium gap-2 px-4">
                            <Users className="h-3.5 w-3.5" />
                            Residents & Staff ({residentsAndStaff.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Security Guards Tab */}
                    <TabsContent value="security" className="outline-none">
                        {securityForce.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">No active guards assigned to gates.</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {securityForce.map((member) => (
                                    <UserCard key={member.user.id} member={member} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Management Tab */}
                    <TabsContent value="management" className="outline-none">
                        {managementTeam.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">No administration profiles provisioned.</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {managementTeam.map((member) => (
                                    <UserCard key={member.user.id} member={member} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Residents and Staff Tab */}
                    <TabsContent value="residents" className="outline-none">
                        {residentsAndStaff.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">No residents or basic staff bound here.</p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {residentsAndStaff.map((member) => (
                                    <UserCard key={member.user.id} member={member} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}