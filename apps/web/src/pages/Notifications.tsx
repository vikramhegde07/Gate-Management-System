import { useCallback, useEffect, useState } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    ExternalLink,
    Loader2,
    RefreshCw,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { apiPrivate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PAGE_SIZE = 20;

interface NotificationContent {
    id: string;
    propertyId: string | null;
    type: string;
    title: string;
    body: string;
    entityType: string | null;
    entityId: string | null;
    data: Record<string, unknown> | null;
    createdAt: string;
    expiresAt: string | null;
}

interface NotificationRecipient {
    id: string;
    notificationId: string;
    userId: string;
    readAt: string | null;
    dismissedAt: string | null;
    createdAt: string;
    notification: NotificationContent;
}

interface NotificationsResponse {
    notifications: NotificationRecipient[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface UnreadCountResponse {
    unreadCount: number;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

interface ActionResponse {
    updatedCount?: number;
    dismissedCount?: number;
}

function getErrorMessage(error: unknown): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const axiosError = error as {
            response?: {
                data?: {
                    message?: string;
                };
            };
        };

        return (
            axiosError.response?.data?.message ??
            "Something went wrong. Please try again."
        );
    }

    return "Something went wrong. Please try again.";
}

function formatDate(date: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        VISITOR_APPROVAL_REQUIRED: "Visitor approval",
        VISITOR_APPROVED: "Visitor approved",
        VISITOR_REJECTED: "Visitor rejected",
        VISITOR_CHECKED_IN: "Visitor checked in",
        VISITOR_CHECKED_OUT: "Visitor checked out",
    };

    return (
        labels[type] ??
        type.replaceAll("_", " ").toLowerCase()
    );
}

/**
 * Update these paths to match your actual frontend routes.
 */
function getNavigationPath(
    notification: NotificationContent
): string | null {
    if (
        notification.entityType === "VISITOR_ENTRY" &&
        notification.entityId
    ) {
        return `/visitors/${notification.entityId}`;
    }

    return null;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<
        NotificationRecipient[]
    >([]);

    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [unreadOnly, setUnreadOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionId, setActionId] = useState<string | null>(
        null
    );
    const [bulkAction, setBulkAction] = useState<
        "read" | "dismiss" | null
    >(null);

    const fetchUnreadCount = useCallback(async () => {
        const response =
            await apiPrivate.get<
                ApiResponse<UnreadCountResponse>
            >("/notifications/unread-count");

        setUnreadCount(response.data.data.unreadCount);
    }, []);

    const fetchNotifications = useCallback(
        async (showLoader = true) => {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            try {
                const response =
                    await apiPrivate.get<
                        ApiResponse<NotificationsResponse>
                    >("/notifications", {
                        params: {
                            page,
                            limit: PAGE_SIZE,
                            unreadOnly,
                        },
                    });

                const result = response.data.data;

                setNotifications(result.notifications);
                setTotal(result.pagination.total);
                setTotalPages(
                    Math.max(1, result.pagination.totalPages)
                );

                await fetchUnreadCount();
            } catch (error) {
                toast.error(getErrorMessage(error));
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [page, unreadOnly, fetchUnreadCount]
    );

    useEffect(() => {
        void fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (
        recipientId: string
    ): Promise<boolean> => {
        setActionId(recipientId);

        try {
            await apiPrivate.patch(
                `/notifications/${recipientId}/read`
            );

            setNotifications((current) =>
                current.map((item) =>
                    item.id === recipientId
                        ? {
                            ...item,
                            readAt:
                                item.readAt ??
                                new Date().toISOString(),
                        }
                        : item
                )
            );

            setUnreadCount((current) =>
                Math.max(
                    0,
                    current -
                    (notifications.some(
                        (item) =>
                            item.id === recipientId &&
                            !item.readAt
                    )
                        ? 1
                        : 0)
                )
            );

            return true;
        } catch (error) {
            toast.error(getErrorMessage(error));
            return false;
        } finally {
            setActionId(null);
        }
    };

    const dismissNotification = async (
        recipientId: string
    ) => {
        setActionId(recipientId);

        try {
            await apiPrivate.patch(
                `/notifications/${recipientId}/dismiss`
            );

            setNotifications((current) =>
                current.filter(
                    (item) => item.id !== recipientId
                )
            );

            const dismissedItem = notifications.find(
                (item) => item.id === recipientId
            );

            if (dismissedItem && !dismissedItem.readAt) {
                setUnreadCount((current) =>
                    Math.max(0, current - 1)
                );
            }

            setTotal((current) => Math.max(0, current - 1));
            toast.success("Notification dismissed");
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setActionId(null);
        }
    };

    const markAllAsRead = async () => {
        setBulkAction("read");

        try {
            await apiPrivate.patch<
                ApiResponse<ActionResponse>
            >("/notifications/read-all");

            toast.success("All notifications marked as read");
            await fetchNotifications(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setBulkAction(null);
        }
    };

    const dismissAll = async () => {
        setBulkAction("dismiss");

        try {
            await apiPrivate.patch<
                ApiResponse<ActionResponse>
            >("/notifications/dismiss-all");

            toast.success("All notifications dismissed");

            // When filtering unread notifications, dismissing all
            // removes those records from the current list.
            await fetchNotifications(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setBulkAction(null);
        }
    };

    const openNotification = async (
        recipient: NotificationRecipient
    ) => {
        if (!recipient.readAt) {
            const success = await markAsRead(recipient.id);

            if (!success) {
                return;
            }
        }

        const path = getNavigationPath(recipient.notification);

        if (path) {
            window.location.assign(path);
        }
    };

    const changeUnreadFilter = (checked: boolean) => {
        setUnreadOnly(checked);
        setPage(1);
    };

    return (
        <main className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Notifications
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        {unreadCount} unread notification
                        {unreadCount === 1 ? "" : "s"}
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => void fetchNotifications(false)}
                    disabled={refreshing || loading}
                >
                    {refreshing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                </Button>
            </header>

            <Separator />

            <section className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="unread-only"
                        checked={unreadOnly}
                        onCheckedChange={(checked) =>
                            changeUnreadFilter(checked === true)
                        }
                    />

                    <label
                        htmlFor="unread-only"
                        className="cursor-pointer text-sm"
                    >
                        Show unread only
                    </label>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void markAllAsRead()}
                        disabled={
                            unreadCount === 0 ||
                            bulkAction !== null
                        }
                    >
                        {bulkAction === "read" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCheck className="mr-2 h-4 w-4" />
                        )}
                        Mark all as read
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void dismissAll()}
                        disabled={
                            total === 0 ||
                            bulkAction !== null
                        }
                    >
                        {bulkAction === "dismiss" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Dismiss all
                    </Button>
                </div>
            </section>

            <section className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-12">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading notifications...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <Bell className="h-10 w-10 text-muted-foreground" />

                        <h2 className="text-lg font-medium">
                            No notifications
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            {unreadOnly
                                ? "You're all caught up."
                                : "You don't have any notifications yet."}
                        </p>
                    </div>
                ) : (
                    notifications.map((recipient) => {
                        const notification =
                            recipient.notification;

                        const isBusy =
                            actionId === recipient.id ||
                            bulkAction !== null;

                        return (
                            <article
                                key={recipient.id}
                                className={`space-y-3 rounded-lg border p-4 ${!recipient.readAt
                                        ? "bg-muted/30"
                                        : ""
                                    }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {!recipient.readAt ? (
                                                <span
                                                    className="block h-2.5 w-2.5 rounded-full bg-primary"
                                                    aria-label="Unread"
                                                />
                                            ) : (
                                                <Check className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <h2 className="font-medium">
                                                {notification.title}
                                            </h2>

                                            <p className="text-sm text-muted-foreground">
                                                {notification.body}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    recipient.createdAt
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <Badge variant="secondary">
                                        {getTypeLabel(
                                            notification.type
                                        )}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            void openNotification(
                                                recipient
                                            )
                                        }
                                        disabled={isBusy}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open notification
                                    </Button>

                                    {!recipient.readAt && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                void markAsRead(
                                                    recipient.id
                                                )
                                            }
                                            disabled={isBusy}
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Mark as read
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            void dismissNotification(
                                                recipient.id
                                            )
                                        }
                                        disabled={isBusy}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Dismiss
                                    </Button>
                                </div>
                            </article>
                        );
                    })
                )}
            </section>

            {!loading && totalPages > 1 && (
                <footer className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </p>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((current) =>
                                    Math.max(1, current - 1)
                                )
                            }
                        >
                            Previous
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() =>
                                setPage((current) =>
                                    Math.min(
                                        totalPages,
                                        current + 1
                                    )
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
                </footer>
            )}
        </main>
    );
}