import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Gate, HostUser } from "@/interfaces/visitor";

interface FilterProps {
    isStaffOrResident: boolean;
    gates: Gate[];
    users: HostUser[];
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export function VisitorFilters({ isStaffOrResident, gates, users, filters, setFilters }: FilterProps) {
    return (
        <div className="p-4 rounded-xl border border-border/80 bg-muted/20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            {/* Search Input */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                    <Search className="h-3 w-3" /> Search Name
                </label>
                <Input value={filters.search} onChange={(e) => setFilters((p: any) => ({ ...p, search: e.target.value }))} placeholder="Filter guest records..." className="bg-background h-9 text-sm" />
            </div>

            {/* Sort Control */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" /> Alphabetical Ordering
                </label>
                <Select value={filters.sortOrder} onValueChange={(val) => setFilters((p: any) => ({ ...p, sortOrder: val }))}>
                    <SelectTrigger className="bg-background h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">Newest Logs First</SelectItem>
                        <SelectItem value="asc">Oldest Logs First</SelectItem>
                        <SelectItem value="name_asc">Guest Name (A-Z)</SelectItem>
                        <SelectItem value="name_desc">Guest Name (Z-A)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Conditional Global Admin Context Filters */}
            {!isStaffOrResident && (
                <>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                            <SlidersHorizontal className="h-3 w-3" /> Gate Isolation
                        </label>
                        <Select value={filters.gateId} onValueChange={(val) => setFilters((p: any) => ({ ...p, gateId: val }))}>
                            <SelectTrigger className="bg-background h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Active Gates</SelectItem>
                                {gates.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
                            <SlidersHorizontal className="h-3 w-3" /> Destination Host
                        </label>
                        <Select value={filters.hostUserId} onValueChange={(val) => setFilters((p: any) => ({ ...p, hostUserId: val }))}>
                            <SelectTrigger className="bg-background h-9 truncate"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Terminal Hosts</SelectItem>
                                {users.map(u => <SelectItem key={u.user.id} value={u.user.id}>{u.user.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
        </div>
    );
}