import type { ChangeEvent, RefObject } from "react";
import { Camera, Clock3, LoaderCircle, Mail, Pencil, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UserType } from "@/interfaces/user";
import { FindFile } from "@/lib/utils";

interface ProfileOverviewCardProps {
    user: UserType | null;
    displayName: string;
    initials: string;
    memberSince: string;
    avatarPreview: string | null;
    isUploadingAvatar: boolean;
    isEditing: boolean;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onStartEditing: () => void;
}

export function ProfileOverviewCard({
    user,
    displayName,
    initials,
    memberSince,
    avatarPreview,
    isUploadingAvatar,
    isEditing,
    fileInputRef,
    onAvatarChange,
    onStartEditing,
}: ProfileOverviewCardProps) {
    return (
        <Card className="overflow-hidden border-border/70 shadow-sm">
            <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400" />

            <CardContent className="p-5 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="relative w-fit">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md sm:h-28 sm:w-28">
                            <AvatarImage
                                src={avatarPreview || FindFile(user!.profileImage) || undefined}
                                alt={displayName}
                            />
                            <AvatarFallback className="bg-emerald-100 text-2xl font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <button
                            type="button"
                            aria-label="Change profile photo"
                            disabled={isUploadingAvatar}
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                        >
                            {isUploadingAvatar ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <Camera className="h-4 w-4" />
                            )}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={onAvatarChange}
                        />
                    </div>

                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">
                                {displayName}
                            </h2>

                            {user?.isActive ? (
                                <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active account
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Inactive account</Badge>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
                            <span className="flex min-w-0 items-center gap-2">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span className="break-all">
                                    {user?.email || "No email available"}
                                </span>
                            </span>

                            <span className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" />
                                {user?.phone || "No phone available"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            Member since {memberSince}
                        </div>
                    </div>

                    {!isEditing && (
                        <Button
                            variant="outline"
                            className="shrink-0 gap-2 self-start sm:self-center"
                            onClick={onStartEditing}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit profile
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}