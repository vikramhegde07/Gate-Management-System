import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import {
    Check,
    LoaderCircle,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { api, apiPrivate } from "@/lib/api";

import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { ProfileOverviewCard } from "@/components/Profile/ProfileOverviewCard";
import { PersonalInfoCard } from "@/components/Profile/PersonalInfoCard";
import { AccountDetailsCard } from "@/components/Profile/AccountDetailsCard";
import { SecurityActionsCard } from "@/components/Profile/SecurityActionsCard";

type AvailabilityStatus =
    | "idle"
    | "checking"
    | "available"
    | "taken"
    | "error";

type ProfileUpdatePayload = {
    name?: string;
    email?: string;
    phone?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

function getErrorMessage(error: unknown, fallback: string) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: { data?: { message?: string } };
            }
        ).response;

        if (response?.data?.message) {
            return response.data.message;
        }
    }

    return fallback;
}

export default function Profile() {
    const { user, setUser, logout } = useAuth();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const [name, setName] = useState(user?.name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [emailAvailability, setEmailAvailability] =
        useState<AvailabilityStatus>("idle");
    const [phoneAvailability, setPhoneAvailability] =
        useState<AvailabilityStatus>("idle");

    // Synchronize the form when the authenticated user changes.
    useEffect(() => {
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
        setPhone(user?.phone ?? "");
    }, [user?.id, user?.name, user?.email, user?.phone]);

    const displayName = user?.name || "Your name";

    const initials =
        displayName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "U";

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
        })
        : "Not available";

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedName = name.trim();

    const emailChanged =
        normalizedEmail !== (user?.email ?? "").trim().toLowerCase();

    const phoneChanged =
        normalizedPhone !== (user?.phone ?? "").trim();

    const nameChanged = normalizedName !== (user?.name ?? "").trim();

    const emailIsValid =
        normalizedEmail.length <= 254 &&
        EMAIL_REGEX.test(normalizedEmail);

    const phoneIsValid = PHONE_REGEX.test(normalizedPhone);

    // Check email availability after the input becomes valid.
    useEffect(() => {
        if (!isEditing || !emailChanged || !emailIsValid) {
            setEmailAvailability("idle");
            return;
        }

        const controller = new AbortController();

        setEmailAvailability("checking");

        const timeoutId = window.setTimeout(async () => {
            try {
                const response = await api.get("/profile/availability", {
                    params: { email: normalizedEmail },
                    signal: controller.signal,
                });

                const available = response.data?.data?.email?.available;

                if (typeof available !== "boolean") {
                    setEmailAvailability("error");
                    return;
                }

                setEmailAvailability(available ? "available" : "taken");
            } catch {
                if (!controller.signal.aborted) {
                    setEmailAvailability("error");
                }
            }
        }, 500);

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [isEditing, emailChanged, emailIsValid, normalizedEmail]);

    // Check phone availability once it contains exactly 10 digits.
    useEffect(() => {
        if (!isEditing || !phoneChanged || !phoneIsValid) {
            setPhoneAvailability("idle");
            return;
        }

        const controller = new AbortController();

        setPhoneAvailability("checking");

        const timeoutId = window.setTimeout(async () => {
            try {
                const response = await api.get("/profile/availability", {
                    params: { phone: normalizedPhone },
                    signal: controller.signal,
                });

                const available = response.data?.data?.phone?.available;

                if (typeof available !== "boolean") {
                    setPhoneAvailability("error");
                    return;
                }

                setPhoneAvailability(available ? "available" : "taken");
            } catch {
                if (!controller.signal.aborted) {
                    setPhoneAvailability("error");
                }
            }
        }, 500);

        return () => {
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [isEditing, phoneChanged, phoneIsValid, normalizedPhone]);

    const resetAvailability = () => {
        setEmailAvailability("idle");
        setPhoneAvailability("idle");
    };

    const startEditing = () => {
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
        setPhone(user?.phone ?? "");
        resetAvailability();
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
        setPhone(user?.phone ?? "");
        resetAvailability();
        setIsEditing(false);
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user || isSaving) return;

        if (normalizedName.length < 2 || normalizedName.length > 100) {
            toast.error("Name must be between 2 and 100 characters.");
            return;
        }

        if (!normalizedEmail || !emailIsValid) {
            toast.error("Enter a valid email address.");
            return;
        }

        if (!phoneIsValid) {
            toast.error("Phone number must contain exactly 10 digits.");
            return;
        }

        if (emailChanged && emailAvailability === "taken") {
            toast.error("That email address is already in use.");
            return;
        }

        if (phoneChanged && phoneAvailability === "taken") {
            toast.error("That phone number is already in use.");
            return;
        }

        if (
            emailChanged &&
            emailAvailability === "checking"
        ) {
            toast.error("Please wait for the email availability check.");
            return;
        }

        if (
            phoneChanged &&
            phoneAvailability === "checking"
        ) {
            toast.error("Please wait for the phone availability check.");
            return;
        }

        const payload: ProfileUpdatePayload = {};

        if (nameChanged) payload.name = normalizedName;
        if (emailChanged) payload.email = normalizedEmail;
        if (phoneChanged) payload.phone = normalizedPhone;

        if (Object.keys(payload).length === 0) {
            toast("There are no changes to save.");
            setIsEditing(false);
            return;
        }

        try {
            setIsSaving(true);

            const response = await apiPrivate.patch("/profile/me", payload);
            const updatedUser = response.data?.data;

            if (!updatedUser) {
                throw new Error("The server did not return the updated profile.");
            }

            setUser(updatedUser);

            setName(updatedUser.name ?? "");
            setEmail(updatedUser.email ?? "");
            setPhone(updatedUser.phone ?? "");

            resetAvailability();
            setIsEditing(false);

            toast.success("Profile updated successfully.");
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Unable to update your profile."),
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Choose a JPEG, PNG, or WebP image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Profile images must be 5 MB or smaller.");
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setAvatarPreview(localPreview);

        const formData = new FormData();
        formData.append("image", file);

        try {
            setIsUploadingAvatar(true);

            const response = await apiPrivate.post(
                "/profile/me/avatar",
                formData,
            );

            const updatedUser = response.data?.data;

            if (!updatedUser) {
                throw new Error("The server did not return the updated profile.");
            }

            setUser(updatedUser);
            setAvatarPreview(null);

            toast.success("Profile photo updated.");
        } catch (error) {
            setAvatarPreview(null);

            toast.error(
                getErrorMessage(error, "Unable to upload your profile photo."),
            );
        } finally {
            URL.revokeObjectURL(localPreview);
            setIsUploadingAvatar(false);
        }
    };

    const handleSignOut = async () => {
        try {
            setIsSigningOut(true);
            await logout();
        } catch (error) {
            toast.error(getErrorMessage(error, "Unable to sign out."));
        } finally {
            setIsSigningOut(false);
        }
    };

    const renderAvailability = (
        status: AvailabilityStatus,
        changed: boolean,
        field: "email" | "phone",
    ) => {
        if (!changed || status === "idle") return null;

        const fieldLabel = field === "email" ? "Email" : "Phone number";

        switch (status) {
            case "checking":
                return (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        Checking availability...
                    </p>
                );

            case "available":
                return (
                    <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        {fieldLabel} is available
                    </p>
                );

            case "taken":
                return (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <X className="h-3.5 w-3.5" />
                        {fieldLabel} is already in use
                    </p>
                );

            case "error":
                return (
                    <p className="text-xs text-muted-foreground">
                        Could not check availability. The server will validate when you save.
                    </p>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-full bg-background">
            <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                {/* Page heading */}
                <ProfileHeader />

                {/* Profile overview */}
                <ProfileOverviewCard
                    user={user}
                    displayName={displayName}
                    initials={initials}
                    memberSince={memberSince}
                    avatarPreview={avatarPreview}
                    isUploadingAvatar={isUploadingAvatar}
                    isEditing={isEditing}
                    fileInputRef={fileInputRef}
                    onAvatarChange={handleAvatarChange}
                    onStartEditing={startEditing}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Personal information */}
                    <PersonalInfoCard
                        user={user}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        isUploadingAvatar={isUploadingAvatar}
                        name={name}
                        setName={setName}
                        email={email}
                        setEmail={setEmail}
                        phone={phone}
                        setPhone={setPhone}
                        emailChanged={emailChanged}
                        emailIsValid={emailIsValid}
                        emailAvailability={emailAvailability}
                        phoneChanged={phoneChanged}
                        phoneIsValid={phoneIsValid}
                        phoneAvailability={phoneAvailability}
                        normalizedName={normalizedName}
                        nameChanged={nameChanged}
                        onStartEditing={startEditing}
                        onCancelEditing={cancelEditing}
                        onSave={handleSave}
                        renderAvailability={renderAvailability}
                    />

                    {/* Account details and actions */}
                    <div className="space-y-6">
                        <AccountDetailsCard user={user} memberSince={memberSince} />
                        <SecurityActionsCard
                            isSigningOut={isSigningOut}
                            onSignOut={handleSignOut}
                        />
                    </div>
                </div>

                <p className="pb-2 text-center text-xs text-muted-foreground">
                    GatePass Pro · Your account, your information.
                </p>
            </div>
        </div>
    );
}