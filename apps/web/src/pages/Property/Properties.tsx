import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import apiPrivate from "@/lib/api";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Property {
    id: string;

    name: string;
    code: string;

    type: string;

    city: string;
    state: string;
    country: string;

    addressLine1: string;
    addressLine2?: string;

    postalCode?: string;

    role?: string;
}

const HOST_URL = import.meta.env.VITE_HOST_URL;


export default function PropertiesPage() {

    const [properties, setProperties] = useState<Property[]>([]);

    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",

        type: "PG",

        addressLine1: "",
        addressLine2: "",

        city: "",
        state: "",
        country: "India",

        postalCode: "",
    });

    const fetchProperties = async () => {
        try {
            const res =
                await apiPrivate.get(
                    "/properties"
                );

            setProperties(res.data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]:
                e.target.value,
        }));
    };

    const handleCreate = async () => {
        try {
            setSubmitting(true);

            await apiPrivate.post(
                "/properties",
                formData
            );

            await fetchProperties();

            setOpen(false);

            setFormData({
                name: "",
                code: "",

                type: "PG",

                addressLine1: "",
                addressLine2: "",

                city: "",
                state: "",
                country: "India",

                postalCode: "",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Properties
                </h1>

                <Dialog
                    open={open}
                    onOpenChange={setOpen}
                >
                    <DialogTrigger asChild>
                        <Button
                            disabled={
                                properties.length >= 2
                            }
                        >
                            Create Property
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Create Property
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label>
                                    Property Name
                                </Label>

                                <Input
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div>
                                <Label>
                                    Property Code
                                </Label>

                                <Input
                                    name="code"
                                    value={
                                        formData.code
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div>
                                <Label>
                                    Property Type
                                </Label>

                                <Select
                                    value={
                                        formData.type
                                    }
                                    onValueChange={(value: string) => setFormData((prev) => ({ ...prev, type: value, })
                                    )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="PG">
                                            PG
                                        </SelectItem>

                                        <SelectItem value="APARTMENT">
                                            Apartment
                                        </SelectItem>

                                        <SelectItem value="OFFICE">
                                            Office
                                        </SelectItem>

                                        <SelectItem value="WAREHOUSE">
                                            Warehouse
                                        </SelectItem>

                                        <SelectItem value="FACTORY">
                                            Factory
                                        </SelectItem>

                                        <SelectItem value="SCHOOL">
                                            School
                                        </SelectItem>

                                        <SelectItem value="OTHER">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>
                                    Address Line 1
                                </Label>

                                <Input
                                    name="addressLine1"
                                    value={
                                        formData.addressLine1
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div>
                                <Label>
                                    Address Line 2
                                </Label>

                                <Input
                                    name="addressLine2"
                                    value={
                                        formData.addressLine2
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div>
                                <Label>City</Label>

                                <Input
                                    name="city"
                                    value={
                                        formData.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div>
                                <Label>State</Label>

                                <Input
                                    name="state"
                                    value={
                                        formData.state
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div>
                                <Label>
                                    Country
                                </Label>

                                <Input
                                    name="country"
                                    value={
                                        formData.country
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div>
                                <Label>
                                    Postal Code
                                </Label>

                                <Input
                                    name="postalCode"
                                    value={
                                        formData.postalCode
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <Button
                                className="w-full"
                                disabled={
                                    submitting
                                }
                                onClick={
                                    handleCreate
                                }
                            >
                                {submitting
                                    ? "Creating..."
                                    : "Create Property"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* PROPERTY GRID */}

            {loading ? (
                <p>Loading...</p>
            ) : properties.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        No properties found.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {properties.map(
                        (property) => {
                            const qrUrl =
                                `${HOST_URL}/visitor/${property.id}`
                            return (
                                <Card
                                    key={property.id}
                                    className="transition hover:shadow-md"
                                >
                                    <CardHeader>
                                        <CardTitle>
                                            {property.name}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                                        <div>
                                            <p>{property.type}</p>

                                            <p>
                                                {property.city},{" "}
                                                {property.state}
                                            </p>

                                            <p>
                                                {property.country}
                                            </p>

                                            {property.role && (
                                                <p className="font-medium text-primary">
                                                    {property.role}
                                                </p>
                                            )}
                                        </div>

                                        {/* QR */}

                                        <div className="flex flex-col items-center gap-2 border-t pt-4">
                                            <div className="rounded-lg bg-white p-2">
                                                <QRCode
                                                    value={qrUrl}
                                                    size={140}
                                                />
                                            </div>

                                            <p className="text-center text-xs">
                                                Visitor QR
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        }
                    )}
                </div>
            )}
        </div>
    );
}