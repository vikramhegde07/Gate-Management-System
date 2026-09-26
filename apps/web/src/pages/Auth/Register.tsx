import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Eye, EyeOff, Loader2, Landmark, User, Mail, Smartphone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        if (errorMsg) setErrorMsg(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrorMsg(null);
            await register(formData);
            navigate("/auth/login");
        } catch (err: any) {
            console.error("Registration structural failure:", err);
            setErrorMsg(err?.response?.data?.message || "Could not register account. Verify input values.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-background select-none">

            {/* LEFT COLUMN: BRAND HERO (Matches Login Sidecar) */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 bg-primary text-primary-foreground flex-col justify-between p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent opacity-40 pointer-events-none" />

                <div className="flex items-center gap-2 relative z-10">
                    <ShieldCheck className="h-8 w-8 text-primary-foreground" />
                    <span className="font-bold text-xl tracking-tight">GatePass Pro</span>
                </div>

                <div className="space-y-4 relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight leading-tight">
                        Enforce Strict Infrastructure Security.
                    </h2>
                    <p className="text-primary-foreground/80 text-sm leading-relaxed">
                        Onboard your node to coordinate gate workflows, audit active guard rotations, process secure QR access, and handle fast multi-tenant dispatch rules.
                    </p>
                </div>

                <div className="text-xs text-primary-foreground/60 relative z-10">
                    &copy; 2026 GatePass Networks. All rights reserved.
                </div>
            </div>

            {/* RIGHT COLUMN: REGISTRATION DESK */}
            <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-6">

                    {/* Mobile Branding Accent */}
                    <div className="flex items-center justify-center gap-2 lg:hidden mb-4">
                        <div className="h-9 w-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">GatePass Pro</span>
                    </div>

                    <Card className="border-border shadow-sm">
                        <CardHeader className="space-y-1.5">
                            <CardTitle className="text-2xl font-bold tracking-tight">Create Operational Node</CardTitle>
                            <CardDescription>
                                Register your administrative manager account to spin up a custom property workspace.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* API Errors */}
                                {errorMsg && (
                                    <div className="p-3 text-xs font-medium rounded-md bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in duration-200">
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Officer Name"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground/60">
                                            <User className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Address */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="name@property.com"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground/60">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Line */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Mobile Communications Line</Label>
                                    <div className="relative">
                                        <Input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 9876543210"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground/60">
                                            <Smartphone className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Block */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="password">Security Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/70 hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Register Button */}
                                <Button
                                    className="w-full mt-2 font-medium"
                                    disabled={loading}
                                    type="submit"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Provisioning Secure Account...
                                        </>
                                    ) : (
                                        "Complete Registration"
                                    )}
                                </Button>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Already Registered?</span></div>
                                </div>

                                <p className="text-center text-sm text-muted-foreground">
                                    Existing operator profile configured?{" "}
                                    <Link
                                        to="/auth/login"
                                        className="text-primary font-semibold hover:underline transition-all"
                                    >
                                        Log In Instead
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Micro-footer */}
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
                        <span className="flex items-center gap-1"><Landmark className="h-3 w-3" /> Encrypted Protocol Cluster</span>
                        <span>&bull;</span>
                        <span>v1.0.0 Stable</span>
                    </div>
                </div>
            </div>
        </div>
    );
}