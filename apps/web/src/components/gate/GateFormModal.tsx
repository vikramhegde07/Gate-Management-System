import { useEffect, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Gate {
    id: string;
    name: string;
    code?: string;
    description?: string;
}

interface GateFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingGate: Gate | null;
    onSubmitGate: (formData: any) => Promise<void>;
}

export function GateFormModal({ isOpen, onOpenChange, editingGate, onSubmitGate }: GateFormModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
    });

    // Sync input states if we switch into edit mode targets
    useEffect(() => {
        if (editingGate) {
            setFormData({
                name: editingGate.name,
                code: editingGate.code || "",
                description: editingGate.description || "",
            });
        } else {
            setFormData({ name: "", code: "", description: "" });
        }
    }, [editingGate, isOpen]);

    const handleFieldChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await onSubmitGate(formData);
            onOpenChange(false);
        } catch (err) {
            console.error("Form transmission failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {editingGate ? "Modify Gate Node" : "Provision New Gate Terminal"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="gate-name">Gate Label / Title</Label>
                        <Input
                            id="gate-name"
                            value={formData.name}
                            onChange={(e) => handleFieldChange("name", e.target.value)}
                            required
                            placeholder="e.g. Main North Entrance, Service Gate"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="gate-code">Checkpoint Access Code</Label>
                        <Input
                            id="gate-code"
                            value={formData.code}
                            onChange={(e) => handleFieldChange("code", e.target.value)}
                            placeholder="e.g. MG-01"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="gate-desc">Operational Description / Instructions</Label>
                        <Input
                            id="gate-desc"
                            value={formData.description}
                            onChange={(e) => handleFieldChange("description", e.target.value)}
                            placeholder="e.g. Authorized for heavy freight and resident pass tokens"
                        />
                    </div>

                    <Button className="w-full mt-2 font-medium gap-2" type="submit" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Synchronizing Node...
                            </>
                        ) : editingGate ? (
                            <>
                                <Save className="h-4 w-4" />
                                Save Configuration Changes
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Deploy Checkpoint
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}