"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { api, getErrorMessage } from "@/shared/services/api";
import { useToast } from "@/shared/provider/ToastProvider";
import EmptyState from "@/shared/ui/EmptyState";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

interface Comment {
  _id: string;
  // null when the author's account was deleted (the server does not cascade comments)
  user: { userName?: string; firstName?: string; lastName?: string } | null;
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  propertyId: string;
  isAuthenticated: boolean;
}

const MAX = 1000;
const DATE = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" });

const authorName = (comment: Comment) =>
  comment.user?.userName || [comment.user?.firstName, comment.user?.lastName].filter(Boolean).join(" ") || "مستخدم محذوف";

/**
 * Comments on a listing. Loading the list and posting fail separately (AUDIT F-16): a failed post keeps the
 * list and the typed text and shows its message above the field.
 */
export default function CommentSection({ propertyId, isAuthenticated }: CommentSectionProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const queryKey = ["property-comments", propertyId];
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async (): Promise<Comment[]> => {
      const res = await api.get(`/property-comments/${propertyId}`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });

  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) {
      setPostError("اكتب تعليقك أولًا.");
      return;
    }
    if (posting) return;
    setPosting(true);
    setPostError(null);
    try {
      const res = await api.post(`/property-comments/${propertyId}`, { text: value });
      const created: Comment | undefined = res.data?.data;
      if (created) queryClient.setQueryData<Comment[]>(queryKey, (prev) => [created, ...(prev ?? [])]);
      else await refetch();
      setText("");
      showToast("نُشر تعليقك.", "success");
    } catch (err) {
      setPostError(getErrorMessage(err, "تعذر نشر تعليقك. حاول مرة أخرى."));
    } finally {
      setPosting(false);
    }
  };

  return (
    <Box component="section" aria-labelledby="comments-title">
      <Typography id="comments-title" component="h2" variant="h5" sx={{ mb: 2 }}>
        التعليقات{data && data.length > 0 ? ` (${data.length})` : ""}
      </Typography>

      {isAuthenticated ? (
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {postError && (
            <Alert severity="error" onClose={() => setPostError(null)}>
              {postError}
            </Alert>
          )}
          <TextField
            label="تعليقك"
            multiline
            minRows={2}
            fullWidth
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={posting}
            helperText={`اسأل عن العقار أو شارك ملاحظتك. ${text.length} / ${MAX}`}
            slotProps={{ htmlInput: { maxLength: MAX } }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={posting || !text.trim()}
              startIcon={posting ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {posting ? "جاري النشر…" : "نشر التعليق"}
            </Button>
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Link href={`/login?redirect=${encodeURIComponent(pathname || "/properties")}`}>سجّل الدخول</Link> لتكتب تعليقًا.
        </Alert>
      )}

      {isPending ? (
        <LoadingState variant="rows" rows={3} label="جاري تحميل التعليقات" />
      ) : isError ? (
        <ErrorState compact title="تعذر تحميل التعليقات" onRetry={() => refetch()} retrying={isFetching} />
      ) : data.length === 0 ? (
        <EmptyState compact icon={<ChatBubbleOutlineOutlined />} title="لا توجد تعليقات بعد" />
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column" }}>
          {data.map((comment) => {
            const name = authorName(comment);
            return (
              <Box
                component="li"
                key={comment._id}
                sx={{ display: "flex", gap: 1.5, py: 2, borderTop: 1, borderColor: "divider", "&:first-of-type": { borderTop: 0, pt: 0 } }}
              >
                <Avatar aria-hidden sx={{ width: 36, height: 36, fontSize: "0.9375rem", bgcolor: "var(--c-primary-soft)", color: "primary.main" }}>
                  {comment.user ? name.charAt(0) : "؟"}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 1 }}>
                    <Typography component="p" variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {name}
                    </Typography>
                    <Typography component="time" variant="caption" color="text.secondary" dateTime={comment.createdAt}>
                      {DATE.format(new Date(comment.createdAt))}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
                    {comment.text}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
