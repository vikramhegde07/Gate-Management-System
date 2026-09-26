import { DoorOpen, Fingerprint, Info, Edit3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Gate {
    id: string;
    name: string;
    code?: string;
    description?: string;
}

interface GateCardProps {
    gate: Gate;
    canManage: boolean;
    onEditClick: (gate: Gate) => void;
}

export function GateCard({ gate, canManage, onEditClick }: GateCardProps) {
    return (
        <Card className="border border-border/80 shadow-sm hover:shadow-md transition-all duration-200 bg-card overflow-hidden group">
            <CardContent className="p-5 space-y-4">
                {/* Upper Frame */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <DoorOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {gate.name}
                            </h3>
                            {gate.code && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono bg-muted px-1.5 py-0.5 rounded w-max">
                                    <Fingerprint className="h-3 w-3 inline text-primary" />
                                    {gate.code}
                                </p>
                            )}
                        </div>
                    </div>

                    {canManage && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onEditClick(gate)}
                            title="Edit Gate Configuration"
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>

                {gate.description && (
                    <>
                        <hr className="border-border/60" />
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                            <Info className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 shrink-0" />
                            <span>{gate.description}</span>
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}