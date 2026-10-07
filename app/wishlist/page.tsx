"use client";

import React, { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteSweepOutlined from "@mui/icons-material/DeleteSweepOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "@/shared/provider/ToastProvider";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import PageBanner from "@/shared/ui/PageBanner";
import PropertyCard, { toPropertyCardData, type ListingLike } from "@/shared/ui/PropertyCard";
import CardGrid from "@/shared/ui/CardGrid";
import EmptyState from "@/shared/ui/EmptyState";
import ErrorState from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import { listingCount } from "@/shared/ui/listing/count";

interface WishlistApi {
  wishlist: (ListingLike & { id: string })[];
  loading: boolean;
  loadError: boolean;
  removeAllFromWishlist: () => Promise<boolean>;
  loadWishlistFromBackend: () => Promise<void>;
}

/** /wishlist: revisit saved listings. The route is signed-in only (middleware). */
export default function WishlistPage() {
  const { isLoading: authLoading } = useAuth();
  const { wishlist, loading, loadError, removeAllFromWishlist, loadWishlistFromBackend } = useWishlist() as WishlistApi;
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleConfirmClear = async () => {
    setClearing(true);
    // The context shows the success or failure toast itself.
    const ok = await removeAllFromWishlist();
    setClearing(false);
    if (ok) setConfirmOpen(false);
  };

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/properties/${id}`);
      showToast("نُسخ رابط الإعلان.", "success");
    } catch {
      showToast("تعذر نسخ الرابط.", "error");
    }
  };

  const busy = authLoading || loading;
  const count = wishlist.length;

  let content: React.ReactNode;
  if (busy) {
    content = <LoadingState variant="cards" count={4} label="جاري تحميل المفضلة" />;
  } else if (loadError && count === 0) {
    content = <ErrorState title="تعذر تحميل المفضلة" onRetry={() => loadWishlistFromBackend()} />;
  } else if (count === 0) {
    content = (
      <EmptyState
        icon={<FavoriteBorderOutlined />}
        title="لا توجد إعلانات في المفضلة"
        description="اضغط على رمز القلب في أي إعلان لتحفظه هنا وترجع إليه لاحقًا."
        action={
          <Button component={Link} href="/properties" variant="contained">
            تصفح العقارات
          </Button>
        }
      />
    );
  } else {
    content = (
      <CardGrid>
        {wishlist.map((item) => {
          const property = toPropertyCardData(item);
          return (
            <PropertyCard
              key={property.id}
              property={property}
              actions={
                <Button
                  size="small"
                  color="secondary"
                  startIcon={<LinkOutlined aria-hidden />}
                  onClick={() => copyLink(property.id)}
                  aria-label={`نسخ رابط «${property.title || "الإعلان"}»`}
                >
                  نسخ الرابط
                </Button>
              }
            />
          );
        })}
      </CardGrid>
    );
  }

  return (
    <main id="main">
      <PageBanner
        title="المفضلة"
        description={
          busy ? undefined : count > 0 ? `${listingCount(count)} في المفضلة` : "الإعلانات التي حفظتها تظهر هنا."
        }
        actions={
          !busy && count > 0 ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepOutlined aria-hidden />}
              onClick={() => setConfirmOpen(true)}
              sx={{ bgcolor: "background.paper" }}
            >
              إزالة الكل
            </Button>
          ) : undefined
        }
      />
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>{content}</Box>
      <ConfirmDialog
        open={confirmOpen}
        title="إزالة كل الإعلانات من المفضلة"
        description={`ستُزال ${listingCount(count)} من المفضلة دفعة واحدة، ولا يمكن التراجع عن ذلك. الإعلانات نفسها لا تُحذف.`}
        confirmLabel="إزالة الكل"
        loadingLabel="جاري الإزالة…"
        loading={clearing}
        onConfirm={handleConfirmClear}
        onClose={() => setConfirmOpen(false)}
      />
    </main>
  );
}
