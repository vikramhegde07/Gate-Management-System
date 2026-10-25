import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    ShieldAlert,
    DoorOpen,
    UserCheck,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    Plus,
    QrCode,
    Activity,
    Shield,
    CalendarCheck,
    UserX,
    LogOut,
    PlayCircle
} from "lucide-react";

import apiPrivate from "@/lib/api";
import { useProperty } from "@/context/PropertyContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
    const { currentProperty, currentRole } = useProperty();
    const [stats, setStats] = useState({
        propertyTotal: 0,
        activeInside: 0,
        pendingApprovals: 0,
        activeGates: 0
    });
    const [recentVisitors, setRecentVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI-only state for Security Guard Duty Shift toggle
    const [isOnDuty, setIsOnDuty] = useState(false);
    const [dutyStartTime, setDutyStartTime] = useState<string | null>(null);

    // Mock guards on duty for Owners/Committee view
    const [guardsOnDuty] = useState([
        { id: "1", name: "Officer Rajesh Kumar", gate: "Main North Entrance", shift: "Day Shift (06:00 - 14:00)" },
        { id: "2", name: "Officer Suresh Rao", gate: "Service Gate B", shift: "Day Shift (06:00 - 14:00)" }
    ]);

    const isSecurity = currentRole === "SECURITY";
    const isOwnerOrCommittee = currentRole === "OWNER" || currentRole === "COMMITTEE";
    const isResidentOrStaff = currentRole === "RESIDENT" || currentRole === "STAFF";

    useEffect(() => {
        if (!currentProperty) return;

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [visitorsRes, gatesRes] = await Promise.all([
                    apiPrivate.get(`/properties/${currentProperty.id}/visitors`),
                    apiPrivate.get(`/properties/${currentProperty.id}/gates`)
                ]);

                const visitors = visitorsRes.data.data || [];
                const gates = gatesRes.data.data || [];

                const activeInside = visitors.filter((v: any) => v.status === "CHECKED_IN" || v.status === "APPROVED").length;
                const pending = visitors.filter((v: any) => v.status === "PENDING").length;

                setStats({
                    propertyTotal: visitors.length,
                    activeInside,
                    pendingApprovals: pending,
                    activeGates: gates.length
                });

                setRecentVisitors(visitors.slice(0, 5));
            } catch (err) {
                console.error("Failed to load dashboard metrics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentProperty]);

    // Role-tailored header metadata configurations
    const getRoleHeaderContent = () => {
        if (isOwnerOrCommittee) {
            return {
                title: "Administrative Command Center",
                subtitle: `Overseeing gateway infrastructure and property metrics for ${currentProperty?.name || "Workspace"}.`
            };
        }
        if (isSecurity) {
            return {
                title: "Gate Control Command Desk",
                subtitle: `Active duty checkpoint management for ${currentProperty?.name || "Workspace"}.`
            };
        }
        return {
            title: "Resident Portal & Guest Dashboard",
            subtitle: `Track expected arrivals and view unit entry logs for ${currentProperty?.name || "Workspace"}.`
        };
    };

    const headerContent = getRoleHeaderContent();

    const handleDutyToggle = () => {
        if (!isOnDuty) {
            setIsOnDuty(true);
            setDutyStartTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
            setIsOnDuty(false);
            setDutyStartTime(null);
        }
    };

    return (
        <div className="space-y-8 select-none">

            {/* TOP ROLE-CUSTOMIZED BANNER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Role: {currentRole || "Guest"} &bull; Command Suite</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {headerContent.title}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {headerContent.subtitle}
                    </p>
                </div>

                {/* QUICK ACTIONS BAR */}
                <div className="flex items-center gap-3">
                    {isSecurity && (
                        <Button asChild className="gap-2 font-medium shadow-sm">
                            <Link to="/visitors">
                                <QrCode className="h-4 w-4" />
                                <span>Process Gate Check-In</span>
                            </Link>
                        </Button>
                    )}
                    {isOwnerOrCommittee && (
                        <Button asChild className="gap-2 font-medium shadow-sm">
                            <Link to="/visitors">
                                <Plus className="h-4 w-4" />
                                <span>New Visitor Entry</span>
                            </Link>
                        </Button>
                    )}
                    {isResidentOrStaff && (
                        <Button asChild className="gap-2 font-medium shadow-sm">
                            <Link to="/visitors">
                                <Clock className="h-4 w-4" />
                                <span>Pre-Register Expected Guest</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* ROLE-CUSTOMIZED METRIC CARDS GRID */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {isResidentOrStaff ? (
                    <>
                        {/* Resident Card 1: Visiting Today / Expected */}
                        <Card className="border-border/85 shadow-sm bg-card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Visiting You Today
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <CalendarCheck className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : stats.activeInside}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Expected guests or active passes</p>
                            </CardContent>
                        </Card>

                        {/* Resident Card 2: Pending Unit Approvals */}
                        <Card className="border-border/85 shadow-sm bg-card">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Awaiting Your Review
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <ShieldAlert className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : stats.pendingApprovals}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Pending visitor approvals</p>
                            </CardContent>
                        </Card>

                        {/* Resident Card 3: Historical Visits */}
                        <Card className="border-border/85 shadow-sm bg-card sm:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Total Unit Guest History
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <Users className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : stats.propertyTotal}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">All-time recorded visitor logs for your unit</p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        {/* Owner / Security Metric 1: On Premise */}
                        <Card className="border-border/80 shadow-sm bg-card hover:border-primary/50 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Currently On-Premise
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <Users className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                                    <span>{loading ? "..." : stats.activeInside}</span>
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Guests verified & inside gates</p>
                            </CardContent>
                        </Card>

                        {/* Owner / Security Metric 2: Pending Approvals */}
                        <Card className="border-border/80 shadow-sm bg-card hover:border-primary/50 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Pending Approvals
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <ShieldAlert className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : stats.pendingApprovals}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Requiring host or security sign-off</p>
                            </CardContent>
                        </Card>

                        {/* Owner / Security Metric 3: Total Logs */}
                        <Card className="border-border/80 shadow-sm bg-card hover:border-primary/50 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Total Logs Today
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <UserCheck className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : stats.propertyTotal}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Recorded checkpoint entries</p>
                            </CardContent>
                        </Card>

                        {/* Owner / Security Metric 4: Active Gates */}
                        <Card className="border-border/80 shadow-sm bg-card hover:border-primary/50 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Operational Gates
                                </CardTitle>
                                <div className="h-8 w-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                                    <DoorOpen className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {loading ? "..." : stats.activeGates}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Active physical entry terminals</p>
                            </CardContent>
                        </Card>
                    </>
                )}

            </div>

            {/* LOWER SECTION: ACTIVITY STREAM & ROLE-SPECIFIC SIDE PANEL */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* Activity Stream (Spans 2 columns) */}
                <Card className="border-border/80 shadow-sm lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold tracking-tight">
                                {isResidentOrStaff ? "Your Unit's Visitor History" : "Recent Activity Stream"}
                            </CardTitle>
                            <CardDescription>
                                {isResidentOrStaff ? "Latest entry logs associated with your residency." : "Latest visitor entry events logged across property gates."}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="text-xs gap-1">
                            <Link to="/visitors">
                                <span>View All Logs</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-xs text-muted-foreground py-8 text-center animate-pulse">Loading activity stream...</p>
                        ) : recentVisitors.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-8 text-center">No visitor records found for this property node.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentVisitors.map((visitor) => (
                                    <div key={visitor.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                {visitor.visitorName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-foreground">{visitor.visitorName}</h4>
                                                <p className="text-xs text-muted-foreground">Purpose: {visitor.purpose || "General Visit"} &bull; Gate: {visitor.gate?.name || "Main Entry"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={visitor.status === "CHECKED_IN" ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider">
                                                {visitor.status}
                                            </Badge>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {new Date(visitor.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* LOWER RIGHT PANEL: ADAPTED BY ROLE */}

                {/* 1. OWNER / COMMITTEE: GUARDS ON DUTY */}
                {isOwnerOrCommittee && (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <span>Guards on Duty</span>
                            </CardTitle>
                            <CardDescription>Active security personnel deployed across gates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {guards.map((guard) => (
                                <div key={guard.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-foreground">{guard.name}</span>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Gate: <span className="font-medium text-foreground">{guard.gate}</span></p>
                                    <p className="text-[11px] text-muted-foreground/80">{guard.shift}</p>
                                </div>
                            ))}
                            <div className="pt-2">
                                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                                    <Link to="/users">Manage Guard Roster</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 2. SECURITY FORCE: DUTY SHIFT CHECK-IN/OUT WIDGET */}
                {isSecurity && (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                <span>Guard Duty Shift</span>
                            </CardTitle>
                            <CardDescription>Log your active duty attendance status.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className={`p-4 rounded-xl border text-center space-y-2 ${isOnDuty ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 border-border text-muted-foreground"}`}>
                                <div className="text-xs uppercase tracking-wider font-bold">Current Status</div>
                                <div className="text-xl font-bold flex items-center justify-center gap-2">
                                    {isOnDuty ? (
                                        <>
                                            <CheckCircle2 className="h-5 w-5" /> ON DUTY
                                        </>
                                    ) : (
                                        <>
                                            <UserX className="h-5 w-5" /> OFF DUTY
                                        </>
                                    )}
                                </div>
                                {dutyStartTime && (
                                    <p className="text-xs opacity-80">Shift started at {dutyStartTime}</p>
                                )}
                            </div>

                            <Button
                                onClick={handleDutyToggle}
                                variant={isOnDuty ? "destructive" : "default"}
                                className="w-full font-medium gap-2"
                            >
                                {isOnDuty ? (
                                    <>
                                        <LogOut className="h-4 w-4" /> Check-Out of Duty Shift
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="h-4 w-4" /> Check-In for Duty Shift
                                    </>
                                )}
                            </Button>
                            <p className="text-[11px] text-muted-foreground text-center">
                                Duty timing is recorded for supervisor audit logging.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* 3. RESIDENT / STAFF: QUICK UNIT ASSISTANT */}
                {isResidentOrStaff && (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span>Quick Pre-Register</span>
                            </CardTitle>
                            <CardDescription>Expecting a delivery or visitor? Skip gate queues.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Pre-registering your visitors instantly issues a digital clearance flag to security guards at the active property gates.
                            </p>
                            <Button asChild className="w-full font-medium gap-2">
                                <Link to="/visitors">
                                    <Plus className="h-4 w-4" /> Pre-Register Guest Now
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

            </div>

        </div>
    );
}

// Inline helper mock constant for guard roster list UI
const guards = [
    { id: "1", name: "Officer Rajesh Kumar", gate: "Main North Entrance", shift: "Day Shift (06:00 - 14:00)" },
    { id: "2", name: "Officer Suresh Rao", gate: "Service Gate B", shift: "Day Shift (06:00 - 14:00)" }
];