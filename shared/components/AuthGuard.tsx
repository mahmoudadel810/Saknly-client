"use client";

import { useContext } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import Loading from "@/app/loading";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const context = useContext(AuthContext);
    
    if (!context) {
        return <Loading />;
    }
    
    const { isLoading } = context;

    if (isLoading) {
        return <Loading />;
    }

    return <>{children}</>;
}
