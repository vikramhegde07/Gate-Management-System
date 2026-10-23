import type { FormEvent, ReactNode } from "react";
import { Check, LoaderCircle, Pencil, ShieldCheck, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { UserType } from "@/interfaces/user";

interface PersonalInfoCardProps {
    user: UserType | null;
    isEditing: boolean;
    isSaving: boolean;
    isUploadingAvatar: boolean;
    name: string;
    setName: (value: string) => void;
    email: string;
    setEmail: (value: string) => void;
    phone: string;
    setPhone: (value: string) => void;
    emailChanged: boolean;
    emailIsValid: boolean;
    emailAvailability: string;
    phoneChanged: boolean;
    phoneIsValid: boolean;
    phoneAvailability: string;
    normalizedName: string;
    nameChanged: boolean;
    onStartEditing: () => void;
    onCancelEditing: () => void;
    onSave: (event: FormEvent<HTMLFormElement>) => void;
    renderAvailability: (
        status: any,
        changed: boolean,
        field: "email" | "phone",
    ) => ReactNode;
}

export function PersonalInfoCard({
    user,
    isEditing,
    isSaving,
    isUploadingAvatar,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    emailChanged,
    emailIsValid,
    emailAvailability,
    phoneChanged,
    phoneIsValid,
    phoneAvailability,
    normalizedName,
    nameChanged,
    onStartEditing,
    onCancelEditing,
    onSave,
    renderAvailability,
}: PersonalInfoCardProps) {
    return (
        <Card className="border-border/70 shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <UserRound className="h-5 w-5 text-emerald-600" />
                        Personal information
                    </CardTitle>
                    <CardDescription>
                        Your basic account details.
                    </CardDescription>
                </div>

                {!isEditing && (
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit personal information"
                        onClick={onStartEditing}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>

            <CardContent>
                {isEditing ? (
                    <form onSubmit={onSave} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="profile-name">Full name</Label>
                            <Input
                                id="profile-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Enter your full name"
                                minLength={2}
                                maxLength={100}
                                autoComplete="name"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Use between 2 and 100 characters.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-email">Email address</Label>
                            <Input
                                id="profile-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                maxLength={254}
                                autoComplete="email"
                                required
                            />
                            {renderAvailability(
                                emailAvailability,
                                emailChanged && emailIsValid,
                                "email",
                            )}
                            {emailChanged && !emailIsValid && email.length > 0 && (
                                <p className="text-xs text-destructive">
                                    Enter a valid email address.
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Email ownership verification will be added with OTP.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-phone">Phone number</Label>
                            <Input
                                id="profile-phone"
                                type="tel"
                                inputMode="numeric"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(
                                        event.target.value.replace(/\D/g, "").slice(0, 10),
                                    )
                                }
                                placeholder="10-digit phone number"
                                autoComplete="tel-national"
                                maxLength={10}
                                required
                            />
                            {renderAvailability(
                                phoneAvailability,
                                phoneChanged && phoneIsValid,
                                "phone",
                            )}
                            {phone.length > 0 && !phoneIsValid && (
                                <p className="text-xs text-destructive">
                                    Enter exactly 10 digits.
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Phone ownership verification will be added with OTP.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancelEditing}
                                disabled={isSaving}
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    isSaving ||
                                    isUploadingAvatar ||
                                    normalizedName.length < 2 ||
                                    normalizedName.length > 100 ||
                                    !emailIsValid ||
                                    !phoneIsValid ||
                                    (emailChanged &&
                                        (emailAvailability === "taken" ||
                                            emailAvailability === "checking")) ||
                                    (phoneChanged &&
                                        (phoneAvailability === "taken" ||
                                            phoneAvailability === "checking")) ||
                                    (!nameChanged && !emailChanged && !phoneChanged)
                                }
                                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {isSaving ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                {isSaving ? "Saving..." : "Save changes"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Full name
                                </Label>
                                <p className="break-words text-sm font-medium">
                                    {user?.name || "Not provided"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Email address
                                </Label>
                                <p className="break-all text-sm font-medium">
                                    {user?.email || "Not provided"}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Phone number
                                </Label>
                                <p className="text-sm font-medium">
                                    {user?.phone || "Not provided"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Account verification
                                </Label>
                                <div>
                                    {user?.isVerified ? (
                                        <Badge
                                            variant="outline"
                                            className="gap-1 border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                                        >
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Not verified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}