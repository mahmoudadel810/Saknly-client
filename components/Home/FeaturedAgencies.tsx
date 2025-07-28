"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Box, Typography, Button, useTheme, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Agency = {
  _id: string;
  name: string;
  logo: {
    url: string;
  };
  description?: string;
};

export default function FeaturedAgencies() {
  const theme = useTheme();
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const swiperRef = useRef<any>(null);

  const fetchFeaturedAgencies = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1';
      if (!apiUrl) {
        console.error("Error: NEXT_PUBLIC_API_URL is not defined.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${apiUrl}/agencies/featured`);
      setAgencies(res.data.data);
    } catch (error) {
      console.error("فشل في تحميل الوكالات:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchFeaturedAgencies();
    }
  }, []);

  const handleContactClick = () => {
    router.push("/contact");
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>جاري تحميل الوكالات...</Typography>
      </Box>
    );
  }

  if (agencies.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: "#f7f7f7",
          py: 5,
          px: { xs: 2, sm: 4 },
          borderRadius: 4,
          my: 6,
          textAlign: "center",
          maxWidth: "100%",
          mx: "auto",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          لا توجد وكالات مميزة متاحة حاليًا.
        </Typography>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={handleContactClick}
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "0.9rem", sm: "1.1rem" },
            borderRadius: 2,
            px: { xs: 3, sm: 5 },
            py: 1.5,
            mt: 3,
          }}
        >
          تواصل معنا
        </Button>
      </Box>
    );
  }

  return (
    <Box
      className="bg-[#fafdff] dark:bg-[#1f2937]"
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        borderRadius: 5,
        my: { xs: 4, md: 8 },
        position: "relative",
        overflow: "hidden",
        maxWidth: "100%",
        mx: "auto",
        transition: 'background 0.3s',
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: { xs: 3, md: 5 },
          px: { xs: 1, sm: 0 },
        }}
      >
        <Typography
          variant="h2"
          className="text-black dark:text-white"
          sx={{
            fontWeight: 800,
            mb: 1.5,
            fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
            letterSpacing: "0.5px",
            textAlign: "center",
            transition: 'color 0.3s',
          }}
        >
          اكتشف الوكالات المميزة
        </Typography>
        <Typography
          variant="body1"
          className="text-neutral-700 dark:text-neutral-300"
          sx={{
            fontSize: { xs: "1rem", sm: "1.08rem", md: "1.12rem" },
            textAlign: "center",
            mb: { xs: 2.5, md: 3.5 },
            maxWidth: 600,
            transition: 'color 0.3s',
          }}
        >
          أفضل الوكالات العقارية الموثوقة في مصر والعالم العربي
        </Typography>
      </Box>

      {/* Slider Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 0, sm: 2, md: 0 },
        }}
      >
        {/* Navigation Arrows */}
        <IconButton
          aria-label="السابق"
          onClick={handlePrev}
          sx={{
            display: { xs: "none", sm: "flex" },
            position: "absolute",
            left: { sm: -16, md: -50 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: 1,
            borderRadius: "50%",
            width: { sm: 36, md: 44 },
            height: { sm: 36, md: 44 },
            border: "1px solid #e3eaf6",
            transition: "all 0.18s",
            color: "#2563eb",
            "&:hover": {
              bgcolor: "#e3eaf6",
              color: "#174ea6",
              borderColor: "#b6c6e3",
              boxShadow: 2,
            },
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: { sm: 16, md: 20 } }} />
        </IconButton>

        <IconButton
          aria-label="التالي"
          onClick={handleNext}
          sx={{
            display: { xs: "none", sm: "flex" },
            position: "absolute",
            right: { sm: -16, md: -50 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.9)",
            boxShadow: 1,
            borderRadius: "50%",
            width: { sm: 36, md: 44 },
            height: { sm: 36, md: 44 },
            border: "1px solid #e3eaf6",
            transition: "all 0.18s",
            color: "#2563eb",
            "&:hover": {
              bgcolor: "#e3eaf6",
              color: "#174ea6",
              borderColor: "#b6c6e3",
              boxShadow: 2,
            },
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: { sm: 16, md: 20 } }} />
        </IconButton>

        {/* Swiper Slider */}
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            480: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination",
          }}
          style={{
            padding: "10px 0 30px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {agencies.map((agency) => (
            <SwiperSlide key={agency._id}>
              <Box
                onClick={() => router.push(`/agencies/${agency._id}`)}
                sx={{
                  bgcolor: theme.palette.mode === "light" ? "white" : "#2f3a4e",
                  borderRadius: 4,
                  boxShadow: "0 1.5px 8px 0 rgba(59,130,246,0.05)",
                  background: 'rgba(255, 255, 255, 0.82)',
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: 180,
                  maxWidth: 260,
                  mx: "auto",
                  transition: "all 0.18s cubic-bezier(.4,1.3,.6,1)",
                  cursor: "pointer",
                  border: "1.5px solid #e3eaf6",
                  overflow: "hidden",
                  position: "relative",
                  p: 0.5,
                  "&:hover": {
                    boxShadow: "0 8px 24px 0 rgba(59,130,246,0.13)",
                    borderColor: "primary.main",
                    transform: "scale(1.03)",
                  },
                }}
              >
                {/* Cover Image */}
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16/9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: 3,
                    background: "rgb(255, 255, 255 , )",
                    position: "relative",
                    transition: "all 0.18s",
                    "&:hover img": {
                      transform: "scale(1.04)",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={agency.logo.url}
                    alt={agency.name}
                    sx={{
                      width: "80%",
                      height: "80%",
                      objectFit: "contain",
                      transition: "transform 0.3s cubic-bezier(.4,1.3,.6,1)",
                    }}
                  />
                </Box>
                {/* Agency Name */}
                <Box
                  sx={{
                    p: 2,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexGrow: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      textAlign: "center",
                      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.08rem" },
                      px: 1,
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.04px",
                      transition: 'color 0.3s',
                      color: '#111827',
                    }}
                  >
                    {agency.name}
                  </Typography>
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 2,
            ".swiper-pagination-bullet": {
              width: 8,
              height: 8,
              bgcolor: "#e3eaf6",
              opacity: 1,
              transition: "all 0.2s",
              mx: "4px !important",
            },
            ".swiper-pagination-bullet-active": {
              bgcolor: "primary.main",
              width: 24,
              borderRadius: 4,
            },
          }}
        >
          <div className="swiper-pagination" />
        </Box>
      </Box>

      {/* Call to action */}
      <Box
        sx={{
          mt: { xs: 3, md: 5 },
          textAlign: "center",
          px: { xs: 1, sm: 0 },
        }}
      >
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={handleContactClick}
          sx={{
            fontWeight: 800,
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.08rem" },
            borderRadius: 3,
            px: { xs: 3, sm: 5 },
            py: 1.5,
            bgcolor: "error.main",
            boxShadow: "0 4px 16px 0 rgba(220,38,38,0.10)",
            letterSpacing: "0.15px",
            textTransform: "none",
            transition: "all 0.18s",
            "&:hover": {
              bgcolor: "error.dark",
              color: "white",
              boxShadow: "0 8px 32px 0 rgba(220,38,38,0.18)",
              transform: "translateY(-2px) scale(1.04)",
            },
          }}
        >
          تواصل معنا
        </Button>
      </Box>
    </Box>
  );
}
