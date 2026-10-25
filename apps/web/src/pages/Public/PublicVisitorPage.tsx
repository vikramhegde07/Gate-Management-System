import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import {
    ShieldCheck,
    User,
    Phone,
    FileText,
    DoorOpen,
    Users,
    Car,
    MessageSquare,
    Camera,
    Loader2,
    CheckCircle2,
    Building2
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Property {
    id: string;
    name: string;
}

interface Gate {
    id: string;
    name: string;
}

interface Host {
    id: string;
    name: string;
}

export default function PublicVisitorPage() {
    const { propertyId } = useParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [property, setProperty] = useState<Property | null>(null);
    const [gates, setGates] = useState<Gate[]>([]);
    const [hosts, setHosts] = useState<Host[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        visitorName: "",
        visitorPhone: "",
        purpose: "",
        gateId: "",
        hostUserId: "",
        vehicleNumber: "",
        vehicleType: "",
        remarks: "",
        visitorPhotoUrl: "", // Maintained original schema key compatibility
    });

    const fetchPropertyData = async () => {
        try {
            const res = await api.get(`/public/property/${propertyId}`);
            setProperty(res.data.data.property);
            setGates(res.data.data.gates);
            setHosts(res.data.data.hosts);
        } catch (err) {
            console.error("Failed to load public portal data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (propertyId) {
            fetchPropertyData();
        }
    }, [propertyId]);

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be smaller than 5MB.");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);
        // If your backend handles multipart/form-data for public entries, 
        // you would push this file into a FormData object during submit.
        // Storing preview simulation string for base payload contract here.
        setFormData(prev => ({ ...prev, visitorPhotoUrl: previewUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post(`/public/property/${propertyId}/visitor-entry`, formData);
            setSubmitted(true);
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Securing connection portal...</span>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
                <Card className="max-w-md w-full border-border">
                    <CardHeader className="space-y-2">
                        <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto" />
                        <CardTitle className="text-xl">Node Not Found</CardTitle>
                        <CardDescription>
                            This public QR reference link is invalid, expired, or has been unassigned from the network.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4 select-none">
                <Card className="w-full max-w-md border-border shadow-md text-center animate-in fade-in zoom-in-95 duration-300">
                    <CardHeader className="space-y-3 pb-4">
                        <div className="h-14 w-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Request Transmitted
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Your entry clearance registration for <span className="font-semibold text-foreground">{property.name}</span> has been logged.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-2">
                        <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed">
                            Please wait at the security checkpoint. The host or gate officer will verify your credentials and authorize access shortly.
                        </div>
                        <Button
                            variant="outline"
                            className="w-full font-medium"
                            onClick={() => window.location.reload()}
                        >
                            Submit Another Request
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4 py-8 select-none">
            <Card className="w-full max-w-xl border-border shadow-sm">
                <CardHeader className="space-y-2 border-b border-border/60 pb-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                        <Building2 className="h-4 w-4" />
                        <span>GatePass Verification Portal</span>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Visitor Entry Request
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Checking into <span className="font-semibold text-foreground">{property.name}</span>. Complete your details below to notify staff.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Visitor Photo Upload Section */}
                        <div className="flex flex-col items-center justify-center pb-2">
                            <div className="relative group">
                                <div className="h-20 w-20 rounded-full border-2 border-dashed border-border bg-muted/40 flex items-center justify-center overflow-hidden shadow-inner">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Visitor snapshot" className="h-full w-full object-cover" />
                                    ) : (
                                        <Camera className="h-6 w-6 text-muted-foreground/60" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:opacity-90 transition-opacity"
                                    title="Capture or upload photo"
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                            <span className="text-[11px] text-muted-foreground mt-1.5 font-medium">Visitor Snapshot <span className="text-muted-foreground/60">(Optional)</span></span>
                        </div>

                        {/* Visitor Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="visitorName" className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="visitorName"
                                required
                                value={formData.visitorName}
                                onChange={(e) => setFormData(prev => ({ ...prev, visitorName: e.target.value }))}
                                placeholder="e.g. Alex Morgan"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1.5">
                            <Label htmlFor="visitorPhone" className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                Mobile Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="visitorPhone"
                                type="tel"
                                required
                                value={formData.visitorPhone}
                                onChange={(e) => setFormData(prev => ({ ...prev, visitorPhone: e.target.value }))}
                                placeholder="10-digit mobile number"
                            />
                        </div>

                        {/* Purpose */}
                        <div className="space-y-1.5">
                            <Label htmlFor="purpose" className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                Purpose of Visit <span className="text-muted-foreground/60 text-xs font-normal">(Optional)</span>
                            </Label>
                            <Input
                                id="purpose"
                                value={formData.purpose}
                                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                                placeholder="e.g. Client Meeting, Delivery, Maintenance"
                            />
                        </div>

                        {/* Gate & Host Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5">
                                    <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                    Entry Gate <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    required
                                    value={formData.gateId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, gateId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Gate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gates.map((gate) => (
                                            <SelectItem key={gate.id} value={gate.id}>
                                                {gate.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                    Person To Meet <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    required
                                    value={formData.hostUserId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, hostUserId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Host" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hosts.map((host) => (
                                            <SelectItem key={host.id} value={host.id}>
                                                {host.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="vehicleNumber" className="flex items-center gap-1.5">
                                    <Car className="h-3.5 w-3.5 text-muted-foreground" />
                                    Vehicle Number <span className="text-muted-foreground/60 text-xs font-normal">(Optional)</span>
                                </Label>
                                <Input
                                    id="vehicleNumber"
                                    value={formData.vehicleNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                    placeholder="e.g. KA01AB1234"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="vehicleType" className="flex items-center gap-1.5">
                                    <Car className="h-3.5 w-3.5 text-muted-foreground" />
                                    Vehicle Type <span className="text-muted-foreground/60 text-xs font-normal">(Optional)</span>
                                </Label>
                                <Input
                                    id="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                                    placeholder="e.g. Car / Bike / Delivery Van"
                                />
                            </div>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-1.5">
                            <Label htmlFor="remarks" className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                Remarks / Notes <span className="text-muted-foreground/60 text-xs font-normal">(Optional)</span>
                            </Label>
                            <Input
                                id="remarks"
                                value={formData.remarks}
                                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                placeholder="Any extra instructions or item details..."
                            />
                        </div>

                        {/* Submit Action Button */}
                        <Button
                            className="w-full mt-4 font-medium"
                            disabled={submitting}
                            type="submit"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Transmitting Clearance Request...
                                </>
                            ) : (
                                "Submit Visitor Request"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}