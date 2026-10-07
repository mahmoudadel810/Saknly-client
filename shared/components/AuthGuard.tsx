"use client";

// Route protection lives in middleware.ts (cookie based) and in the pages that need a user.
// This wrapper always renders its children so public pages are server-rendered with content
// instead of a loading spinner while the session is being checked.
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
