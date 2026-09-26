import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { api, apiPrivate, setUnauthorizedHandler } from "@/lib/api";

import type { UserType } from "@/interfaces/user";

interface AuthContextType {
    user: UserType | null;
    loading: boolean;

    login: (credentials: {
        identifier: string;
        password: string;
    }) => Promise<void>;

    register: (data: {
        name: string;
        email?: string;
        phone?: string;
        password: string;
    }) => Promise<void>;

    logout: () => Promise<void>;

    fetchMe: () => Promise<void>;

    setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [user, setUser] = useState<UserType | null>(null);

    const [loading, setLoading] = useState(true);

    const fetchMe = async () => {
        try {
            const res =
                await apiPrivate.get("/auth/me");

            setUser(res.data.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            setUser(null);
        });
    }, []);

    const login = async (credentials: {
        identifier: string;
        password: string;
    }) => {
        await api.post("/auth/login", credentials);

        await fetchMe();
    };

    const register = async (data: {
        name: string;
        email?: string;
        phone?: string;
        password: string;
    }) => {
        await api.post("/auth/register", data);
    };

    const logout = async () => {
        try {
            await apiPrivate.post("/auth/logout");
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,

                login,
                register,
                logout,

                fetchMe,

                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
};