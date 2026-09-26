import { useState } from "react";
import { Loader2, UserPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Gate, HostUser } from "@/interfaces/visitor";
import type { PropertyRole } from "@/interfaces/property";
import { useAuth } from "@/context/AuthContext";

interface VisitorFormModalProps {
    role: PropertyRole | null;
    gates: Gate[];
    users: HostUser[];
    onSubmit: (formData: any) => Promise<void>;
}

export function VisitorFormModal({ role, gates, users, onSubmit }: VisitorFormModalProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        visitorName: "",
        visitorPhone: "",
        purpose: "",
        gateId: "",
        hostUserId: "",
        vehicleNumber: "",
        vehicleType: "NONE",
        remarks: "",
    });

    const isResidentFlow = role === "RESIDENT" || role === "STAFF";

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (formData.hostUserId === "" && isResidentFlow) formData.hostUserId = user?.id!;
            await onSubmit(formData);
            setOpen(false);
            setFormData({
                visitorName: "",
                visitorPhone: "",
                purpose: "",
                gateId: "",
                hostUserId: "",
                vehicleNumber: "",
                vehicleType: "NONE",
                remarks: "",
            });
        } catch (err) {
            console.error("Form transmission fault:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={isResidentFlow ? "secondary" : "default"} className="font-semibold gap-2 shadow-sm shrink-0">
                    {isResidentFlow ? (
                        <>
                            <Clock className="h-4 w-4 text-primary" />
                            <span>Expecting Someone? Pre-Register</span>
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-4 w-4" />
                            <span>Add Entry Log</span>
                        </>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {isResidentFlow ? "Pre-Register Expected Guest" : "Check-In Incoming Visitor Entry"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <Label htmlFor="vis-name">Visitor Name</Label>
                            <Input id="vis-name" required value={formData.visitorName} onChange={(e) => setFormData(p => ({ ...p, visitorName: e.target.value }))} placeholder="John Doe" />
                        </div>
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <Label htmlFor="vis-phone">Visitor Phone Line</Label>
                            <Input id="vis-phone" type="tel" required value={formData.visitorPhone} onChange={(e) => setFormData(p => ({ ...p, visitorPhone: e.target.value }))} placeholder="9876543210" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="vis-purpose">Purpose of Entry</Label>
                        <Input id="vis-purpose" required value={formData.purpose} onChange={(e) => setFormData(p => ({ ...p, purpose: e.target.value }))} placeholder="Meeting / Food Delivery / Structural Maintenance" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <Label>Check-In Point Gate</Label>
                            <Select required value={formData.gateId} onValueChange={(val) => setFormData(p => ({ ...p, gateId: val }))}>
                                <SelectTrigger><SelectValue placeholder="Select Entry Terminal" /></SelectTrigger>
                                <SelectContent>
                                    {gates.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {!isResidentFlow && (
                            <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                <Label>Target Host Destination</Label>
                                <Select required value={formData.hostUserId} onValueChange={(val) => setFormData(p => ({ ...p, hostUserId: val }))}>
                                    <SelectTrigger><SelectValue placeholder="Select Resident Host" /></SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => <SelectItem key={u.user.id} value={u.user.id}>{u.user.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <Label htmlFor="vis-vnum">Vehicle License Plate</Label>
                            <Input id="vis-vnum" value={formData.vehicleNumber} onChange={(e) => setFormData(p => ({ ...p, vehicleNumber: e.target.value }))} placeholder="KA-01-AB-1234" />
                        </div>
                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                            <Label>Vehicle Type classification</Label>
                            <Select value={formData.vehicleType} onValueChange={(val) => setFormData(p => ({ ...p, vehicleType: val }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">No Vehicle (Pedestrian)</SelectItem>
                                    <SelectItem value="BIKE">Two Wheeler (Bike)</SelectItem>
                                    <SelectItem value="CAR">Four Wheeler (Car)</SelectItem>
                                    <SelectItem value="AUTO">Auto Rickshaw</SelectItem>
                                    <SelectItem value="TRUCK">Heavy Carrier (Truck)</SelectItem>
                                    <SelectItem value="OTHER">Other Structural Unit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="vis-remarks">Internal Operator Remarks / Notes</Label>
                        <Input id="vis-remarks" value={formData.remarks} onChange={(e) => setFormData(p => ({ ...p, remarks: e.target.value }))} placeholder="Optional clearance parameters..." />
                    </div>

                    <Button className="w-full font-medium" type="submit" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : isResidentFlow ? "Publish Pre-Registration Pass" : "Authorize immediate Gate Admission"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}