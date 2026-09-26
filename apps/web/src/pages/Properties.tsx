import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import { Building2, Plus, UserPlus, MapPin, ShieldAlert, ArrowRight } from "lucide-react";
import { useProperty } from "@/context/PropertyContext";
import { apiPrivate } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PropertyType } from "@/interfaces/property";

const HOST_URL = import.meta.env.VITE_HOST_URL || window.location.origin;

export default function Properties() {
    const { memberships, selectProperty, loading, refreshMemberships } = useProperty();
    const navigate = useNavigate();
    const location = useLocation();

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form Inputs
    const [joinCode, setJoinCode] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        type: "PG" as PropertyType,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "India",
        postalCode: "",
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await apiPrivate.post("/properties", formData);
            await refreshMemberships();
            setIsCreateOpen(false);
            setFormData({
                name: "",
                type: "PG",
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                country: "India",
                postalCode: "",
            });
        } catch (err) {
            console.error("Error creating property:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleJoinProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            // Assuming your endpoint handles joining via unique code/invite
            await apiPrivate.post("/properties/join", { code: joinCode });
            await refreshMemberships();
            setIsJoinOpen(false);
            setJoinCode("");
        } catch (err) {
            console.error("Error joining property:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleWorkspaceSelect = (propertyId: string) => {
        selectProperty(propertyId);
        // If intercepted by the PropertyGuard, route them back to where they were going, otherwise /dashboard
        const destination = location.state?.from?.pathname || "/dashboard";
        navigate(destination, { replace: true });
    };

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-10">
            {/* WELCOME BANNER */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Select Workspace</h1>
                <p className="text-muted-foreground mt-1">
                    Choose an active property workspace to manage gates or view your access portal.
                </p>
            </div>

            {/* SECTION 1: ACTIVE WORKSPACES */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> Your Active Memberships
                </h2>

                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((n) => (
                            <Card key={n} className="h-48 animate-pulse bg-muted/40" />
                        ))}
                    </div>
                ) : memberships.length === 0 ? (
                    <Card className="border-dashed bg-muted/10">
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                            <ShieldAlert className="h-10 w-10 text-muted-foreground/70" />
                            <p className="font-medium text-muted-foreground">You don't belong to any properties yet</p>
                            <p className="text-xs text-muted-foreground/70 max-w-sm">
                                Create a property profile as an owner or ask your supervisor for an invite code to join.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {memberships.map(({ property, role, designation }) => {
                            const qrUrl = `${HOST_URL}/visitor/${property.id}`;
                            return (
                                <Card
                                    key={property.id}
                                    className="flex flex-col justify-between transition-all hover:ring-2 hover:ring-primary/20 hover:shadow-md cursor-pointer group"
                                    onClick={() => handleWorkspaceSelect(property.id)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                    {property.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs mt-1 uppercase tracking-wider font-semibold">
                                                    {property.type}
                                                </CardDescription>
                                            </div>
                                            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                                                {role}
                                            </span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4 pb-4">
                                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                            <span>{property.city}, {property.state}, {property.country}</span>
                                        </div>
                                        {designation && (
                                            <p className="text-xs bg-muted p-1.5 rounded font-medium text-foreground">
                                                Assignation: {designation}
                                            </p>
                                        )}

                                        {/* INLINE QR FOR EASY COP/POSTER EXPORT */}
                                        <div className="flex flex-col items-center gap-1.5 border-t pt-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="rounded border bg-white p-1.5">
                                                <QRCode value={qrUrl} size={90} />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground tracking-tight">
                                                Public Gate QR Link
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t bg-muted/20 py-2.5 px-4 flex justify-between items-center text-xs text-primary font-medium">
                                        <span>Enter Dashboard</span>
                                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SECTION 2: ACTIONS GRID (ONBOARDING) */}
            <div className="space-y-4 border-t pt-8">
                <h2 className="text-xl font-semibold tracking-tight">Onboarding Options</h2>
                <div className="grid gap-5 md:grid-cols-2">

                    {/* ACTION A: CREATE PROPERTY */}
                    <Card className="flex flex-col justify-between">
                        <CardHeader>
                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
                                <Plus className="h-6 w-6" />
                            </div>
                            <CardTitle>Are you a property owner?</CardTitle>
                            <CardDescription>
                                Establish a new digital registry platform. Register gates, configure operational rules, and enroll guards.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full">Create New Property</Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Register Property Profile</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateProperty} className="space-y-4 pt-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="name">Property Name</Label>
                                            <Input id="name" name="name" required value={formData.name} onChange={handleFormChange} placeholder="e.g. Skyline Heights" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="type">Property Classification</Label>
                                            <Select value={formData.type} onValueChange={(v: PropertyType) => setFormData(p => ({ ...p, type: v }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {["PG", "APARTMENT", "OFFICE", "WAREHOUSE", "FACTORY", "SCHOOL", "OTHER"].map((type) => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="addressLine1">Address Line 1</Label>
                                            <Input id="addressLine1" name="addressLine1" required value={formData.addressLine1} onChange={handleFormChange} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                                            <Input id="addressLine2" name="addressLine2" value={formData.addressLine2} onChange={handleFormChange} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="city">City</Label>
                                                <Input id="city" name="city" required value={formData.city} onChange={handleFormChange} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="state">State</Label>
                                                <Input id="state" name="state" required value={formData.state} onChange={handleFormChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="postalCode">Postal Code</Label>
                                                <Input id="postalCode" name="postalCode" required value={formData.postalCode} onChange={handleFormChange} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="country">Country</Label>
                                                <Input id="country" name="country" required value={formData.country} onChange={handleFormChange} />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full mt-2" disabled={submitting}>
                                            {submitting ? "Processing..." : "Deploy Profile"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>

                    {/* ACTION B: JOIN PROPERTY */}
                    <Card className="flex flex-col justify-between">
                        <CardHeader>
                            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 mb-2">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <CardTitle>Joining an existing property?</CardTitle>
                            <CardDescription>
                                Are you a guest, resident, or staff member? Input a secure verification key issued by your manager to map your account.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                                        Join via Invitation Token
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Enter Property Token</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleJoinProperty} className="space-y-4 pt-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="token">Invite Key / Passcode</Label>
                                            <Input
                                                id="token"
                                                required
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value)}
                                                placeholder="e.g. PROP-XYZ-123"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={submitting}>
                                            {submitting ? "Validating..." : "Request Access"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>

                </div>
            </div>
        </div>
    );
}