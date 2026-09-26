import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "@/lib/api";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Property {
    id: string;
    name: string;
}

interface Gate {
    id: string;
    name: string;
}

interface Host {
    id: string;
    name: string;
}

export default function PublicVisitorPage() {
    const { propertyId } = useParams();

    const [loading, setLoading] = useState(true);

    const [submitted, setSubmitted] =
        useState(false);

    const [property, setProperty] =
        useState<Property | null>(null);

    const [gates, setGates] = useState<Gate[]>([]);

    const [hosts, setHosts] = useState<Host[]>([]);

    const [formData, setFormData] = useState({
        visitorName: "",
        visitorPhone: "",

        purpose: "",

        gateId: "",
        hostUserId: "",

        vehicleNumber: "",
        vehicleType: "",

        remarks: "",
    });

    const fetchPropertyData = async () => {
        try {
            const res = await api.get(
                `/public/property/${propertyId}`
            );

            setProperty(
                res.data.data.property
            );

            setGates(
                res.data.data.gates
            );

            setHosts(
                res.data.data.hosts
            );
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (propertyId) {
            fetchPropertyData();
        }
    }, [propertyId]);

    const handleSubmit = async () => {
        try {
            await api.post(
                `/public/property/${propertyId}/visitor-entry`,
                formData
            );

            setSubmitted(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!property) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Property not found.
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>
                            Request Submitted
                        </CardTitle>

                        <CardDescription>
                            Your visitor request
                            has been submitted
                            successfully.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-lg border bg-muted p-4 text-sm">
                            Please wait for
                            security approval
                            before entering the
                            premises.
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle>
                        Gate Entry
                    </CardTitle>

                    <CardDescription>
                        {property.name}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Visitor Name */}

                    <div>
                        <Label>
                            Visitor Name
                        </Label>

                        <Input
                            value={
                                formData.visitorName
                            }
                            onChange={(e) =>
                                setFormData(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        visitorName:
                                            e
                                                .target
                                                .value,
                                    })
                                )
                            }
                        />
                    </div>

                    {/* Phone */}

                    <div>
                        <Label>
                            Phone Number
                        </Label>

                        <Input
                            value={
                                formData.visitorPhone
                            }
                            onChange={(e) =>
                                setFormData(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        visitorPhone:
                                            e
                                                .target
                                                .value,
                                    })
                                )
                            }
                        />
                    </div>

                    {/* Purpose */}

                    <div>
                        <Label>
                            Purpose
                        </Label>

                        <Input
                            value={
                                formData.purpose
                            }
                            onChange={(e) =>
                                setFormData(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        purpose:
                                            e
                                                .target
                                                .value,
                                    })
                                )
                            }
                        />
                    </div>

                    {/* Gate */}

                    <div>
                        <Label>
                            Gate
                        </Label>

                        <Select
                            value={
                                formData.gateId
                            }
                            onValueChange={(
                                value
                            ) =>
                                setFormData(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        gateId:
                                            value,
                                    })
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Gate" />
                            </SelectTrigger>

                            <SelectContent>
                                {gates.map(
                                    (
                                        gate
                                    ) => (
                                        <SelectItem
                                            key={
                                                gate.id
                                            }
                                            value={
                                                gate.id
                                            }
                                        >
                                            {
                                                gate.name
                                            }
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Host */}

                    <div>
                        <Label>
                            Person To Meet
                        </Label>

                        <Select
                            value={
                                formData.hostUserId
                            }
                            onValueChange={(
                                value
                            ) =>
                                setFormData(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        hostUserId:
                                            value,
                                    })
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Person" />
                            </SelectTrigger>

                            <SelectContent>
                                {hosts.map(
                                    (
                                        host
                                    ) => (
                                        <SelectItem
                                            key={
                                                host.id
                                            }
                                            value={
                                                host.id
                                            }
                                        >
                                            {
                                                host.name
                                            }
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Vehicle Number */}

                    <div>
                        <Label>
                            Vehicle Number
                        </Label>

                        <Input
                            value={
                                formData.vehicleNumber
                            }
                            onChange={(e) =>
                                setFormData(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        vehicleNumber:
                                            e
                                                .target
                                                .value,
                                    })
                                )
                            }
                        />
                    </div>

                    {/* Vehicle Type */}

                    <div>
                        <Label>
                            Vehicle Type
                        </Label>

                        <Input
                            value={
                                formData.vehicleType
                            }
                            onChange={(e) =>
                                setFormData(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        vehicleType:
                                            e
                                                .target
                                                .value,
                                    })
                                )
                            }
                        />
                    </div>

                    {/* Remarks */}

                    <div>
                        <Label>
                            Remarks
                        </Label>

                        <Input
                            value={
                                formData.remarks
                            }
                            onChange={(e) =>
                                setFormData(
                                    (
                                        prev
                                    ) => ({
                                        ...prev,
                                        remarks:
                                            e
                                                .target
                                                .value,
                                    })
                                )
                            }
                        />
                    </div>

                    <Button
                        className="w-full"
                        onClick={
                            handleSubmit
                        }
                    >
                        Submit Request
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}