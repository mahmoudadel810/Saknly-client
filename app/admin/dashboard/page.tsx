"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from "@mui/material";
import { useDarkMode } from "@/app/context/DarkModeContext";
import { API_URL, authHeader } from "@/shared/utils/auth";
import ApartmentOutlined from '@mui/icons-material/ApartmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import MailOutlined from '@mui/icons-material/MailOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import { api } from "@/shared/services/api";

// Type definitions
interface StatCardProps {
  title: string;
  /** null when the count could not be loaded; rendered as a dash, never as 0 */
  value: number | null;
  change?: number;
  icon: React.ElementType;
  color: string;
  trend: number;
}

interface User {
  _id: string;
  userName: string;
  email: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
}

const StatCard = ({ title, value, change, icon: Icon, color, trend }: StatCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon sx={{ fontSize: 24 }} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value === null ? '—' : value.toLocaleString()}</p>
        </div>
      </div>
      {typeof change === 'number' && (
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
        trend > 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
      }`}>
        {trend > 0 ? <TrendingUpOutlined sx={{ fontSize: 16 }} /> : <TrendingDownOutlined sx={{ fontSize: 16 }} />}
        <span>{Math.abs(change)}%</span>
      </div>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return { color: 'bg-success-100 text-success-800', text: 'نشط' };
      case 'inactive':
        return { color: 'bg-danger-100 text-danger-800', text: 'غير نشط' };
      case 'pending':
        return { color: 'bg-warning-100 text-warning-800', text: 'معلق' };
      default:
        return { color: 'bg-secondary-100 text-secondary-800', text: 'غير محدد' };
    }
  };

  const { color, text } = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
};

const USERS_API = `${API_URL}/users/get-all-users`;

const AdminDashboard = () => {
  const { isDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // The dashboard shows only the 5 most recent users.
  const usersPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [totalProperties, setTotalProperties] = useState<number | null>(null);
  const [totalAgencies, setTotalAgencies] = useState<number | null>(null);
  const [analyticsUserCount, setAnalyticsUserCount] = useState<number | null>(null);
  const [activityCounts, setActivityCounts] = useState<{
    pendingProperties: number | null;
    testimonials: number | null;
    propertyInquiries: number | null;
    contactMessages: number | null;
  } | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [statsReloadKey, setStatsReloadKey] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${USERS_API}?page=${currentPage}&limit=${usersPerPage}&search=${encodeURIComponent(searchTerm)}`,
          {
            headers: authHeader(),
          }
        );
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalUsers(data.pagination?.totalDocs || 0);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    // Totals from the admin analytics endpoint
    const fetchStats = async () => {
      setStatsError(false);
      try {
        const res = await api.get('/admin/analytics');
        const analytics = res.data?.data ?? res.data ?? {};
        const count = (v: unknown) => (typeof v === 'number' ? v : null);
        setAnalyticsUserCount(count(analytics.userCount));
        setTotalProperties(count(analytics.propertyCount));
        setTotalAgencies(count(analytics.agencyCount));
        setActivityCounts({
          pendingProperties: count(analytics.pendingPropertyCount),
          testimonials: count(analytics.testimonialCount),
          propertyInquiries: count(analytics.inquiryCount),
          contactMessages: count(analytics.contactCount),
        });
      } catch (err) {
        // Unknown is not zero: show dashes and a retry instead of fake totals.
        setAnalyticsUserCount(null);
        setTotalProperties(null);
        setTotalAgencies(null);
        setActivityCounts(null);
        setStatsError(true);
      }
    };
    fetchStats();
  }, [statsReloadKey]);

  const stats = {
    totalUsers: analyticsUserCount ?? (statsError ? null : totalUsers),
    totalProperties: totalProperties,
    totalAgencies: totalAgencies
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-secondary-700">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: isDarkMode ? 'var(--dark-800)' : undefined,
        color: isDarkMode ? 'var(--c-text)' : undefined,
      }}
    >
      {/* Header */}
      <div
        className="shadow-sm border-b"
        style={{
          background: isDarkMode ? 'var(--dark-700)' : '#fff',
          borderColor: isDarkMode ? 'var(--dark-600)' : undefined,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-6">
            <div className="text-center">
              <h1
                className="text-3xl font-bold"
                style={{ color: isDarkMode ? 'var(--c-text)' : undefined }}
              >
                لوحة تحكم المشرف
              </h1>
              <p
                className="mt-1"
                style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}
              >
                إدارة شاملة لجميع عمليات الموقع
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {statsError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-300 bg-red-50 text-red-800 px-4 py-3 flex items-center justify-between gap-4"
          >
            <span>تعذر تحميل إحصائيات لوحة التحكم. الأرقام غير متاحة حاليًا.</span>
            <button
              type="button"
              onClick={() => setStatsReloadKey((k) => k + 1)}
              className="shrink-0 rounded-md border border-red-400 px-3 py-1 text-sm font-medium hover:bg-red-100"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <StatCard
            title="إجمالي المستخدمين"
            value={stats.totalUsers}
            icon={PeopleOutlined}
            color="bg-primary-600"
            trend={1}
          />
          <StatCard
            title="إجمالي العقارات"
            value={stats.totalProperties}
            icon={HomeOutlined}
            color="bg-success-600"
            trend={1}
          />
          <StatCard
            title="الوكالات النشطة"
            value={stats.totalAgencies}
            icon={ApartmentOutlined}
            color="bg-warning-600"
            trend={1}
          />
        </div>

        {/* Activity counts — straight from /admin/analytics (no invented chart data) */}
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: isDarkMode ? 'var(--c-text)' : undefined }}
        >
          النشاط الحالي
        </h3>
        {activityCounts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="عقارات قيد المراجعة"
              value={activityCounts.pendingProperties}
              icon={ScheduleOutlined}
              color="bg-warning-600"
              trend={1}
            />
            <StatCard
              title="آراء العملاء"
              value={activityCounts.testimonials}
              icon={ChatBubbleOutlineOutlined}
              color="bg-primary-600"
              trend={1}
            />
            <StatCard
              title="استفسارات العقارات"
              value={activityCounts.propertyInquiries}
              icon={NotificationsOutlined}
              color="bg-success-600"
              trend={1}
            />
            <StatCard
              title="رسائل التواصل"
              value={activityCounts.contactMessages}
              icon={MailOutlined}
              color="bg-secondary-600"
              trend={1}
            />
          </div>
        ) : (
          <p
            className="mb-8 text-sm"
            style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}
          >
            {statsError ? 'بيانات النشاط غير متاحة حاليًا.' : 'جاري تحميل بيانات النشاط...'}
          </p>
        )}

        {/* Users Table */}
        <div
          className="rounded-xl shadow-sm border"
          style={{
            background: isDarkMode ? 'var(--dark-700)' : '#fff',
            borderColor: isDarkMode ? 'var(--dark-600)' : undefined,
            color: isDarkMode ? 'var(--c-text)' : undefined,
          }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: isDarkMode ? 'var(--dark-600)' : undefined }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? 'var(--c-text)' : undefined }}
              >
                أحدث المستخدمون
              </h3>
            </div>
          </div>
          {isMobile ? (
            <div className="flex flex-col gap-3 p-4">
              {isLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : error ? (
                <div className="text-center py-8 text-danger-500">{error}</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">لا يوجد مستخدمون</div>
              ) : (
                users.slice(0, 5).map((user) => (
                  <div
                    key={user._id}
                    className="rounded-lg border p-4 flex flex-col gap-2"
                    style={{
                      background: isDarkMode ? 'var(--dark-800)' : 'var(--c-bg)',
                      borderColor: isDarkMode ? 'var(--dark-600)' : undefined,
                      color: isDarkMode ? 'var(--c-text)' : undefined,
                    }}
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-base font-bold" style={{ color: isDarkMode ? 'var(--c-text)' : undefined }}>{user.userName.split('@')[0]}</span>
                      <span className="text-xs" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>{user.email}</span>
                    </div>
                    <div className="flex flex-row-reverse items-center gap-2 mt-1">
                      <StatusBadge status={user.status} />
                      <span className="text-xs" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>{formatDate(user.lastLoginAt || user.createdAt)}</span>
                      <span className="text-xs" style={{ color: isDarkMode ? 'var(--c-text-2)' : undefined }}>{formatTime(user.lastLoginAt || user.createdAt)}</span>
                    </div>
                    <div className="flex flex-row-reverse items-center gap-2 mt-1 text-success-600 text-xs">
                      <div className="h-2 w-2 bg-success-400 rounded-full"></div>
                      تسجيل دخول جديد
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full" style={{ background: isDarkMode ? 'var(--dark-800)' : undefined, color: isDarkMode ? 'var(--c-text)' : undefined }}>
                <thead className="bg-secondary-50" style={{ background: isDarkMode ? 'var(--dark-700)' : undefined }}>
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>
                      اسم المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>
                      تاريخ آخر تسجيل دخول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>
                      النشاط الأخير
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200" style={{ background: isDarkMode ? 'var(--dark-800)' : '#fff' }}>
                   {isLoading ? (
                     <tr><td colSpan={4} className="text-center py-8">جاري التحميل...</td></tr>
                   ) : error ? (
                     <tr><td colSpan={4} className="text-center py-8 text-danger-500">{error}</td></tr>
                   ) : users.length === 0 ? (
                     <tr><td colSpan={4} className="text-center py-8">لا يوجد مستخدمون</td></tr>
                   ) : (
                     users.slice(0, 5).map((user) => (
                       <tr key={user._id} className="hover:bg-secondary-50 transition-colors" style={{ background: isDarkMode ? 'var(--dark-800)' : undefined, color: isDarkMode ? 'var(--c-text)' : undefined }}>
                         <td className="px-6 py-4 whitespace-nowrap text-right">
                           <div className="text-sm font-medium" style={{ color: isDarkMode ? 'var(--c-text)' : undefined }}>
                             {user.userName.split('@')[0]}
                           </div>
                           <div className="text-sm" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>
                             {user.email}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <StatusBadge status={user.status} />
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>
                           <div className="flex flex-col">
                             <span className="font-medium">{formatDate(user.lastLoginAt || user.createdAt)}</span>
                             <span className="text-xs" style={{ color: isDarkMode ? 'var(--c-text-2)' : undefined }}>{formatTime(user.lastLoginAt || user.createdAt)}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ color: isDarkMode ? 'var(--c-muted)' : undefined }}>
                           <div className="flex items-center gap-2 justify-end">
                             <div className="h-2 w-2 bg-success-400 rounded-full"></div>
                             تسجيل دخول جديد
                           </div>
                         </td>
                       </tr>
                     ))
                   )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;