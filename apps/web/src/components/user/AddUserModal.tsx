import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddUserModalProps {
    onUserCreated: (formData: any) => Promise<void>;
}

export function AddUserModal({ onUserCreated }: AddUserModalProps) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "SECURITY",
        designation: "",
    });

    const handleFieldChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await onUserCreated(formData);
            setOpen(false);
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: "SECURITY",
                designation: "",
            });
        } catch (err) {
            console.error("Failed adding operator node", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-medium gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    <span>Add User</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Provision User Profile</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                            <Label htmlFor="modal-name">Full Name</Label>
                            <Input id="modal-name" value={formData.name} onChange={(e) => handleFieldChange("name", e.target.value)} required placeholder="Officer / Resident Name" />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="modal-email">Email Address</Label>
                            <Input id="modal-email" type="email" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="name@domain.com" />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="modal-phone">Mobile Phone</Label>
                            <Input id="modal-phone" type="tel" value={formData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} required placeholder="9876543210" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="modal-password">Initial Password Access</Label>
                        <Input id="modal-password" type="password" value={formData.password} onChange={(e) => handleFieldChange("password", e.target.value)} required placeholder="••••••••" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Operational Role</Label>
                            <Select value={formData.role} onValueChange={(val) => handleFieldChange("role", val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SECURITY">Security Force</SelectItem>
                                    <SelectItem value="STAFF">Facility Staff</SelectItem>
                                    <SelectItem value="COMMITTEE">Management Committee</SelectItem>
                                    <SelectItem value="RESIDENT">Resident Tenant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="modal-designation">Designation / Note</Label>
                            <Input id="modal-designation" value={formData.designation} onChange={(e) => handleFieldChange("designation", e.target.value)} placeholder="e.g. Tower A Guard" />
                        </div>
                    </div>

                    <Button className="w-full mt-2 font-medium" type="submit" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Provisioning Credentials...
                            </>
                        ) : (
                            "Confirm & Create Account"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}