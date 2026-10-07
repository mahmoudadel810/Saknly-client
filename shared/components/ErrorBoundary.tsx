"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ErrorState from "@/shared/ui/ErrorState";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * The last-resort boundary around the whole app (app/layout.tsx). Route errors are caught earlier by
 * app/error.tsx, which keeps the header; this one only renders when the providers or the shell themselves fail,
 * so its fallback cannot rely on them. The error is logged, never shown.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled render error:", error, errorInfo.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <Box component="main" sx={{ maxWidth: 640, mx: "auto", px: 2, py: { xs: 6, md: 10 } }}>
        <ErrorState
          title="حدث خطأ غير متوقع"
          description="أعد تحميل الصفحة. إن تكرر الخطأ، ارجع إلى الصفحة الرئيسية."
          retryLabel="إعادة تحميل الصفحة"
          onRetry={() => window.location.reload()}
        />
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {/* A full navigation: the client router may be the part that failed. */}
          <Button href="/" variant="text">
            الصفحة الرئيسية
          </Button>
        </Box>
      </Box>
    );
  }
}

export default ErrorBoundary;
