"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Box, Typography } from "@mui/material";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const PropertyPieChart = ({ pending }: { pending: { sale: any[]; rent: any[]; student: any[] } }) => {
  // Prepare data for the chart
  const chartData = {
    labels: ["شقق", "محلات", "سكن طلبة"],
    datasets: [
      {
        data: [
          pending.rent.length,       // Apartments (rent)
          pending.sale.length,       // Shops (sale)
          pending.student.length,    // Student housing
        ],
        backgroundColor: [
          "#3B82F6", // Blue for apartments
          "#10B981", // Green for shops
          "#F59E0B", // Amber for student housing
        ],
        borderColor: [
          "#2563EB", // Darker blue
          "#059669", // Darker green
          "#D97706", // Darker amber
        ],
        borderWidth: 1,
      },
    ],
  };

  // Custom styling for the chart
  const options = {
    plugins: {
      legend: {
        rtl: true,
        position: "bottom" as const,
        labels: {
          font: {
            family: "Cairo, Tajawal, Arial",
            size: 14,
          },
          padding: 20,
        },
      },
      tooltip: {
        bodyFont: {
          family: "Cairo, Tajawal, Arial",
        },
        titleFont: {
          family: "Cairo, Tajawal, Arial",
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Box
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color: "#1E3A8A",
          fontFamily: "Cairo, Tajawal, Arial",
        }}
      >
        توزيع العقارات المعلقة حسب النوع
      </Typography>
      <Box sx={{ height: "300px", direction: "ltr" }}>
        <Pie data={chartData} options={options} />
      </Box>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: "text.secondary",
          fontFamily: "Cairo, Tajawal, Arial",
        }}
      >
        إجمالي العقارات المعلقة: {pending.rent.length + pending.sale.length + pending.student.length}
      </Typography>
    </Box>
  );
};

export default PropertyPieChart;