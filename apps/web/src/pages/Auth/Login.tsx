import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Eye, EyeOff, Loader2, Landmark, Smartphone, Mail } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        if (errorMsg) setErrorMsg(null); // Clear errors on fresh input
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrorMsg(null);
            await login(formData);
            // PropertyGuard will capture if a workspace is missing and re-route accordingly
            navigate("/dashboard");
        } catch (err: any) {
            console.error("Authentication error:", err);
            setErrorMsg(err?.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-background select-none">

            {/* LEFT COLUMN: BRAND HERO (Hidden on Mobile/Tablets) */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 bg-primary text-primary-foreground flex-col justify-between p-10 relative overflow-hidden">
                {/* Decorative Background Matrix Accent */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent opacity-40 pointer-events-none" />

                <div className="flex items-center gap-2 relative z-10">
                    <ShieldCheck className="h-8 w-8 text-primary-foreground" />
                    <span className="font-bold text-xl tracking-tight">GatePass Pro</span>
                </div>

                <div className="space-y-4 relative z-10">
                    <h2 className="text-3xl font-bold tracking-tight leading-tight">
                        Digitalized Gate Entry For Safer Properties.
                    </h2>
                    <p className="text-primary-foreground/80 text-sm leading-relaxed">
                        Replace obsolete manual ledger logs. Streamline visitor check-ins, oversee guard activity, and secure access across all your properties effortlessly.
                    </p>
                </div>

                <div className="text-xs text-primary-foreground/60 relative z-10">
                    &copy; 2026 GatePass Networks. All rights reserved.
                </div>
            </div>

            {/* RIGHT COLUMN: LOGIN DESK */}
            <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-6">

                    {/* Mobile App Identity (Visible only on smaller breakpoints) */}
                    <div className="flex items-center justify-center gap-2 lg:hidden mb-4">
                        <div className="h-9 w-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">GatePass Pro</span>
                    </div>

                    <Card className="border-border shadow-sm">
                        <CardHeader className="space-y-1.5">
                            <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
                            <CardDescription>
                                Access your security node using your registered account credentials.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* API Error Banner */}
                                {errorMsg && (
                                    <div className="p-3 text-xs font-medium rounded-md bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in duration-200">
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Identifier Field */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="identifier">Email / Mobile Number</Label>
                                    <div className="relative">
                                        <Input
                                            id="identifier"
                                            name="identifier"
                                            value={formData.identifier}
                                            onChange={handleChange}
                                            placeholder="name@property.com or phone"
                                            required
                                            className="pr-10"
                                            autoComplete="username"
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground/60">
                                            <Smartphone className="h-4 w-4 block md:hidden" />
                                            <Mail className="h-4 w-4 hidden md:block" />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <a href="#forgot" className="text-xs font-medium text-primary hover:underline transition-all opacity-80 hover:opacity-100">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="pr-10"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/70 hover:text-foreground transition-colors"
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Action Submit Trigger */}
                                <Button
                                    className="w-full mt-2 font-medium"
                                    disabled={loading}
                                    type="submit"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating Secure Session...
                                        </>
                                    ) : (
                                        "Authenticate Login"
                                    )}
                                </Button>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">New Team Member?</span></div>
                                </div>

                                <p className="text-center text-sm text-muted-foreground">
                                    Don't have an operational account?{" "}
                                    <Link
                                        to="/auth/register"
                                        className="text-primary font-semibold hover:underline transition-all"
                                    >
                                        Register Now
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Quick Micro-footer */}
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
                        <span className="flex items-center gap-1"><Landmark className="h-3 w-3" /> Multi-Tenant Architecture</span>
                        <span>&bull;</span>
                        <span>v1.0.0 Stable</span>
                    </div>
                </div>
            </div>
        </div>
    );
}