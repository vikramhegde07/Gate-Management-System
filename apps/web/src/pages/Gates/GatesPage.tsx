import { useEffect, useState } from "react";
import { DoorOpen, ShieldAlert, Plus, ShieldCheck } from "lucide-react";

import apiPrivate from "@/lib/api";
import { useProperty } from "@/context/PropertyContext";
import { Button } from "@/components/ui/button";
import { GateCard } from "@/components/gate/GateCard";
import { GateFormModal } from "@/components/gate/GateFormModal";

interface Gate {
    id: string;
    name: string;
    code?: string;
    description?: string;
}

export default function GatesPage() {
    const { currentProperty, currentRole } = useProperty();
    const [gates, setGates] = useState<Gate[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal Interaction States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGate, setEditingGate] = useState<Gate | null>(null);

    // Strict Permission Verification: Only owners or committee members mutate entries
    const canManageGates = currentRole === "OWNER" || currentRole === "COMMITTEE";

    const fetchWorkspaceGates = async () => {
        if (!currentProperty) return;
        try {
            setLoading(true);
            const res = await apiPrivate.get(`/properties/${currentProperty.id}/gates`);
            setGates(res.data.data || []);
        } catch (err) {
            console.error("Failed processing terminal check:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaceGates();
    }, [currentProperty]);

    const handleOpenCreateModal = () => {
        setEditingGate(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (gate: Gate) => {
        setEditingGate(gate);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (formData: any) => {
        if (!currentProperty) return;

        if (editingGate) {
            // Edit execution node path
            await apiPrivate.put(`/properties/${currentProperty.id}/gates/${editingGate.id}`, formData);
        } else {
            // Creation deployment path
            await apiPrivate.post(`/properties/${currentProperty.id}/gates`, formData);
        }
        await fetchWorkspaceGates();
    };

    return (
        <div className="space-y-6">
            {/* Header Desk */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <DoorOpen className="h-6 w-6 text-primary" />
                        <span>Checkpoint Configuration</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure digital logging portals and point access gates for <span className="font-semibold text-foreground">{currentProperty?.name}</span>
                    </p>
                </div>

                {/* Expose Trigger only if security validation checks pass */}
                {canManageGates && currentProperty && (
                    <Button
                        onClick={handleOpenCreateModal}
                        className="font-medium gap-2 shadow-sm"
                        disabled={gates.length >= 5} // Adjusted threshold limit safely
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create Gate</span>
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <p className="text-xs font-medium animate-pulse mt-1">Interrogating point gate layouts...</p>
                </div>
            ) : gates.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-12 text-center max-w-md mx-auto my-10 space-y-3">
                    <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto stroke-[1.5]" />
                    <h3 className="font-bold text-lg text-foreground">No Access Terminals Found</h3>
                    <p className="text-sm text-muted-foreground">
                        This property instance hasn't registered any operational gateway nodes yet.
                    </p>
                    {canManageGates && (
                        <Button size="sm" variant="outline" className="mt-2" onClick={handleOpenCreateModal}>
                            Provision First Entry Gate
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Security Clearance Alert Banner for low privilege tiers */}
                    {!canManageGates && (
                        <div className="p-3 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground flex items-center gap-2 max-w-max">
                            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                            <span>Read-Only clearance profile: Structural adjustments require explicit administrator role assignment.</span>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {gates.map((gate) => (
                            <GateCard
                                key={gate.id}
                                gate={gate}
                                canManage={canManageGates}
                                onEditClick={handleOpenEditModal}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Global Context Form Modal */}
            <GateFormModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingGate={editingGate}
                onSubmitGate={handleFormSubmit}
            />
        </div>
    );
}