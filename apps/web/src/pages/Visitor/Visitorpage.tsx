import { useEffect, useState } from "react";
import { Users, ShieldCheck, CheckCircle2, LogOut, ClipboardList, Info } from "lucide-react";

import apiPrivate from "@/lib/api";
import { useProperty } from "@/context/PropertyContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Gate, HostUser, Visitor } from "@/interfaces/visitor";
import { VisitorFormModal } from "@/components/visitor/VisitorFormModal";
import { VisitorFilters } from "@/components/visitor/VisitorFilters";

export default function VisitorPage() {
    const { currentProperty, currentRole } = useProperty();
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [gates, setGates] = useState<Gate[]>([]);
    const [users, setUsers] = useState<HostUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Advanced Local State Filter Matrix
    const [filters, setFilters] = useState({
        search: "",
        sortOrder: "desc",
        gateId: "ALL",
        hostUserId: "ALL"
    });

    const isStaffOrResident = currentRole === "RESIDENT" || currentRole === "STAFF";
    const isSecurityForce = currentRole === "SECURITY";

    const fetchWorkspaceLogs = async () => {
        if (!currentProperty) return;
        try {
            setLoading(true);

            // Build scalable URL search query keys for backend attachment
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append("search", filters.search);
            if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);
            if (filters.gateId !== "ALL") queryParams.append("gateId", filters.gateId);
            if (filters.hostUserId !== "ALL") queryParams.append("hostUserId", filters.hostUserId);

            const res = await apiPrivate.get(`/properties/${currentProperty.id}/visitors?${queryParams.toString()}`);
            setVisitors(res.data.data || []);
        } catch (err) {
            console.error("Failed synchronizing log infrastructure:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentProperty) return;

        const fetchDependencies = async () => {
            const [gatesRes, usersRes] = await Promise.all([
                apiPrivate.get(`/properties/${currentProperty.id}/gates`),
                apiPrivate.get(`/properties/${currentProperty.id}/users`)
            ]);
            setGates(gatesRes.data.data || []);
            setUsers(usersRes.data.data || []);
        };

        fetchDependencies();
    }, [currentProperty]);

    useEffect(() => {
        fetchWorkspaceLogs();
    }, [currentProperty, filters]);

    const handleCreateVisitor = async (formData: any) => {
        if (!currentProperty) return;
        await apiPrivate.post(`/properties/${currentProperty.id}/visitors`, formData);
        await fetchWorkspaceLogs();
    };

    const handleApprove = async (id: string) => {
        if (!currentProperty) return;
        await apiPrivate.patch(`/properties/${currentProperty.id}/visitors/${id}/approve`);
        await fetchWorkspaceLogs();
    };

    const handleCheckout = async (id: string) => {
        if (!currentProperty) return;
        await apiPrivate.patch(`/properties/${currentProperty.id}/visitors/${id}/checkout`);
        await fetchWorkspaceLogs();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
            case "CHECKED_IN":
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-medium text-[11px] uppercase tracking-wider">On-Premise</Badge>;
            case "PENDING":
                return <Badge variant="outline" className="text-amber-500 border-amber-500/30 font-medium text-[11px] uppercase tracking-wider animate-pulse">Awaiting Approval</Badge>;
            default:
                return <Badge variant="secondary" className="text-muted-foreground font-medium text-[11px] uppercase tracking-wider">Checked Out</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Upper Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        <span>Visitor Records</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isStaffOrResident ? "Pre-register incoming guests and check pass logs bound to your unit" : `Operational flow ledger tracking checkpoint streams for ${currentProperty?.name}`}
                    </p>
                </div>

                {currentProperty && (
                    <VisitorFormModal role={currentRole} gates={gates} users={users} onSubmit={handleCreateVisitor} />
                )}
            </div>

            {/* Live Filter Block Desk */}
            <VisitorFilters isStaffOrResident={isStaffOrResident} gates={gates} users={users} filters={filters} setFilters={setFilters} />

            {/* Logs Table Output Canvas */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <p className="text-xs font-medium animate-pulse mt-1">Interrogating encrypted guest logs...</p>
                </div>
            ) : visitors.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-12 text-center max-w-md mx-auto space-y-3">
                    <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto stroke-[1.5]" />
                    <h3 className="font-bold text-lg text-foreground">Operational Slate Empty</h3>
                    <p className="text-sm text-muted-foreground">
                        No real-time tracking streams or historical guest indexes found matching the active filters.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[110px]">Timestamp</TableHead>
                                <TableHead>Visitor Profile</TableHead>
                                <TableHead>Terminal Gate</TableHead>
                                <TableHead>Host Destination</TableHead>
                                <TableHead>Vehicle Tag</TableHead>
                                <TableHead>Security State</TableHead>
                                <TableHead className="text-right">Execution Controls</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visitors.map((visitor) => (
                                <TableRow key={visitor.id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="text-xs font-medium text-muted-foreground">
                                        {new Date(visitor.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-sm text-foreground">{visitor.visitorName}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{visitor.visitorPhone}</div>
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-foreground">
                                        {visitor.gate?.name || <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell className="text-xs text-foreground">
                                        {visitor.hostUser?.name || <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                        {visitor.vehicleNumber ? (
                                            <span className="bg-muted/80 px-1.5 py-0.5 rounded border border-border text-[11px] text-foreground font-semibold">
                                                {visitor.vehicleNumber}
                                            </span>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(visitor.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {isSecurityForce ? (
                                            <div className="flex justify-end gap-2">
                                                {visitor.status === "PENDING" && (
                                                    <Button size="sm" className="h-7 px-2.5 text-xs font-semibold gap-1" onClick={() => handleApprove(visitor.id)}>
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        <span>Approve</span>
                                                    </Button>
                                                )}
                                                {visitor.status === "CHECKED_IN" && (
                                                    <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs font-semibold gap-1 border border-border" onClick={() => handleCheckout(visitor.id)}>
                                                        <LogOut className="h-3.5 w-3.5 text-destructive" />
                                                        <span>Checkout</span>
                                                    </Button>
                                                )}
                                                {visitor.status !== "PENDING" && visitor.status !== "CHECKED_IN" && (
                                                    <span className="text-xs text-muted-foreground flex items-center justify-end gap-1 font-medium">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/60" /> Complete
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground/80 italic flex items-center justify-end gap-1">
                                                <Info className="h-3 w-3" /> Protected
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}