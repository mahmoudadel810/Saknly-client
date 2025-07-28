"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Home, Building, 
  MessageCircle, Eye, DollarSign, Clock, CheckCircle,
  AlertCircle, Filter, Calendar, Download, RotateCcw,
  Search, Bell, Settings
} from 'lucide-react';
import axios from "axios";
import { useMediaQuery } from "@mui/material";
import { useDarkMode } from "@/app/context/DarkModeContext";

// Type definitions
interface StatCardProps {
  title: string;
  value: number;
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
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value.toLocaleString()}</p>
        </div>
      </div>
      {typeof change === 'number' && (
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
        trend > 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
      }`}>
        {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
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

const USERS_API = "/api/users"; // or your real endpoint

const AdminDashboard = () => {
  const { isDarkMode } = useDarkMode();
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalAgencies, setTotalAgencies] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          `${USERS_API}?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}`,
          {
            headers: {
              Authorization: `${process.env.TOKEN_PREFIX}${token}`,
            },
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
    // Fetch properties count
    const fetchStats = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1';
        // Properties
        const propertiesRes = await axios.get(`${BASE_URL}/properties/allProperties`);
        setTotalProperties(propertiesRes.data.count || (Array.isArray(propertiesRes.data.data) ? propertiesRes.data.data.length : 0));
        // Agencies
        const agenciesRes = await axios.get(`${BASE_URL}/agencies/featured`);
        setTotalAgencies(agenciesRes.data.data.length || 0);
      } catch (err) {
        setTotalProperties(0);
        setTotalAgencies(0);
      }
    };
    fetchStats();
  }, []);

  const stats = {
    totalUsers: totalUsers,
    totalProperties: totalProperties,
    totalAgencies: totalAgencies
  };

  const chartData = [
    { name: 'يناير', users: 400, properties: 240 },
    { name: 'فبراير', users: 300, properties: 139 },
    { name: 'مارس', users: 200, properties: 980 },
    { name: 'أبريل', users: 278, properties: 390 },
    { name: 'مايو', users: 189, properties: 480 },
    { name: 'يونيو', users: 239, properties: 380 },
  ];

  const pieData = [
    { name: 'بيع', value: 45, color: '#3b82f6' },
    { name: 'إيجار', value: 35, color: '#22c55e' },
    { name: 'سكن طلبة', value: 20, color: '#f59e0b' },
  ];

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
        color: isDarkMode ? 'var(--dark-text-900)' : undefined,
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
                style={{ color: isDarkMode ? 'var(--dark-text-900)' : undefined }}
              >
                لوحة تحكم المشرف
              </h1>
              <p
                className="mt-1"
                style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}
              >
                إدارة شاملة لجميع عمليات الموقع
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <StatCard
            title="إجمالي المستخدمين"
            value={stats.totalUsers}
            icon={Users}
            color="bg-primary-600"
            trend={1}
          />
          <StatCard
            title="إجمالي العقارات"
            value={stats.totalProperties}
            icon={Home}
            color="bg-success-600"
            trend={1}
          />
          <StatCard
            title="الوكالات النشطة"
            value={stats.totalAgencies}
            icon={Building}
            color="bg-warning-600"
            trend={1}
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          {/* Pie Chart */}
          <div
            className="rounded-xl p-6 shadow-sm border flex flex-col items-center"
            style={{
              background: isDarkMode ? 'var(--dark-700)' : '#fff',
              borderColor: isDarkMode ? 'var(--dark-600)' : undefined,
              color: isDarkMode ? 'var(--dark-text-900)' : undefined,
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 text-center"
              style={{ color: isDarkMode ? 'var(--dark-text-900)' : undefined }}
            >
              توزيع أنواع العقارات
            </h3>
            <ResponsiveContainer width={260} height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}
                  >
                    {item.name}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: isDarkMode ? 'var(--dark-text-700)' : undefined }}
                  >
                    ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div
          className="rounded-xl shadow-sm border"
          style={{
            background: isDarkMode ? 'var(--dark-700)' : '#fff',
            borderColor: isDarkMode ? 'var(--dark-600)' : undefined,
            color: isDarkMode ? 'var(--dark-text-900)' : undefined,
          }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: isDarkMode ? 'var(--dark-600)' : undefined }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? 'var(--dark-text-900)' : undefined }}
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
                      background: isDarkMode ? 'var(--dark-800)' : 'var(--secondary-50)',
                      borderColor: isDarkMode ? 'var(--dark-600)' : undefined,
                      color: isDarkMode ? 'var(--dark-text-900)' : undefined,
                    }}
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-base font-bold" style={{ color: isDarkMode ? 'var(--dark-text-900)' : undefined }}>{user.userName.split('@')[0]}</span>
                      <span className="text-xs" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>{user.email}</span>
                    </div>
                    <div className="flex flex-row-reverse items-center gap-2 mt-1">
                      <StatusBadge status={user.status} />
                      <span className="text-xs" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>{formatDate(user.lastLoginAt || user.createdAt)}</span>
                      <span className="text-xs" style={{ color: isDarkMode ? 'var(--dark-text-700)' : undefined }}>{formatTime(user.lastLoginAt || user.createdAt)}</span>
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
              <table className="min-w-full" style={{ background: isDarkMode ? 'var(--dark-800)' : undefined, color: isDarkMode ? 'var(--dark-text-900)' : undefined }}>
                <thead className="bg-secondary-50" style={{ background: isDarkMode ? 'var(--dark-700)' : undefined }}>
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>
                      اسم المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>
                      تاريخ آخر تسجيل دخول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>
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
                       <tr key={user._id} className="hover:bg-secondary-50 transition-colors" style={{ background: isDarkMode ? 'var(--dark-800)' : undefined, color: isDarkMode ? 'var(--dark-text-900)' : undefined }}>
                         <td className="px-6 py-4 whitespace-nowrap text-right">
                           <div className="text-sm font-medium" style={{ color: isDarkMode ? 'var(--dark-text-900)' : undefined }}>
                             {user.userName.split('@')[0]}
                           </div>
                           <div className="text-sm" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>
                             {user.email}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <StatusBadge status={user.status} />
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>
                           <div className="flex flex-col">
                             <span className="font-medium">{formatDate(user.lastLoginAt || user.createdAt)}</span>
                             <span className="text-xs" style={{ color: isDarkMode ? 'var(--dark-text-700)' : undefined }}>{formatTime(user.lastLoginAt || user.createdAt)}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-right" style={{ color: isDarkMode ? 'var(--dark-text-500)' : undefined }}>
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