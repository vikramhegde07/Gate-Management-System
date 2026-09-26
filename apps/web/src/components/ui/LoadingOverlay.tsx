import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
    variant?: "fullscreen" | "block";
    className?: string;
}

export const LoadingOverlay = ({
    isLoading,
    message = "Loading...",
    variant = "block",
    className,
}: LoadingOverlayProps) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                        "z-50 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-[2px]",
                        variant === "fullscreen" ? "fixed inset-0" : "absolute inset-0 rounded-[inherit]",
                        className
                    )}
                >
                    <div className="relative flex items-center justify-center">
                        {/* Outer Pulse Ring */}
                        <motion.div
                            animate={{ opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute h-12 w-12 rounded-full bg-primary"
                        />

                        {/* Inner Spinner */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="relative z-10 text-primary"
                        >
                            <Loader2 className="h-8 w-8" />
                        </motion.div>
                    </div>

                    {message && (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-medium text-muted-foreground"
                        >
                            {message}
                        </motion.p>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};