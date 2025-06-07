"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface User {
  id: string;
  email: string;
  user_metadata: {
    role?: string;
    active?: boolean;
    name?: string;
  };
}

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalUsers: number;
  totalProducts: number;
}

interface RefundRequest {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
  subject: string;
  user?: {
    email: string;
  };
  order?: {
    total: number;
    status: string;
  };
  [key: string]: unknown;
}

interface Download {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  order_id: string;
  title: string;
  downloaded_at: string;
  user?: {
    email: string;
  };
  product?: {
    title: string;
  };
  [key: string]: unknown;
}

interface Summary {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
}

interface TrendData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }>;
}

interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  averageOpenRate: number;
  averageClickRate: number;
}

export default function AdminPage() {
  const [refundsEnabled, setRefundsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<Download[]>([]);
  const [refundSearch, setRefundSearch] = useState('');
  const [downloadSearch, setDownloadSearch] = useState('');
  const [refundPage, setRefundPage] = useState(1);
  const [downloadPage, setDownloadPage] = useState(1);
  const REFUND_PAGE_SIZE = 10;
  const DOWNLOAD_PAGE_SIZE = 10;
  const [summary, setSummary] = useState<Summary>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [newsletterStats, setNewsletterStats] = useState<NewsletterStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const typedUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata || {}
        };
        setUser(typedUser);
      }
      setLoadingUser(false);
      // Redirect if not admin
      if (!data.user || data.user.user_metadata?.role !== 'admin') {
        router.replace('/login');
      }
    };
    getUser();
  }, [router]);

  useEffect(() => {
    const fetchSettingsAndAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch refunds_enabled
        const { data: settingsData } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "refunds_enabled")
          .single();
        if (settingsData && typeof settingsData.value.enabled === "boolean") {
          setRefundsEnabled(settingsData.value.enabled);
        }
        // Fetch analytics
        const [{ count: refundCount }, { count: downloadCount }] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Refunded"),
          supabase.from("order_items").select("id", { count: "exact", head: true }).not("downloaded_at", "is", null),
        ]);
        setAnalytics({
          totalOrders: refundCount ?? 0,
          totalRevenue: 0, // Assuming totalRevenue is not available in the current query
          averageOrderValue: 0, // Assuming averageOrderValue is not available in the current query
          totalUsers: 0, // Assuming totalUsers is not available in the current query
          totalProducts: downloadCount ?? 0,
        });
        // Fetch recent refund requests (paginated)
        const { data: refundTickets } = await supabase
          .from('refund_requests')
          .select('*, user:user_id(email)')
          .order('created_at', { ascending: false })
          .range((refundPage - 1) * REFUND_PAGE_SIZE, refundPage * REFUND_PAGE_SIZE - 1);

        if (refundTickets) {
          const typedRefundRequests: RefundRequest[] = refundTickets.map(ticket => ({
            id: ticket.id,
            order_id: ticket.order_id,
            user_id: ticket.user_id,
            amount: ticket.amount || 0,
            reason: ticket.reason || '',
            status: ticket.status,
            created_at: ticket.created_at,
            subject: ticket.subject || '',
            user: ticket.user ? { email: ticket.user.email } : undefined
          }));
          setRefundRequests(typedRefundRequests);
        }

        // Fetch recent downloads (paginated)
        const { data: recentDownloadData } = await supabase
          .from('order_items')
          .select('*, user:user_id(email), product:product_id(title)')
          .not('downloaded_at', 'is', null)
          .order('downloaded_at', { ascending: false })
          .range((downloadPage - 1) * DOWNLOAD_PAGE_SIZE, downloadPage * DOWNLOAD_PAGE_SIZE - 1);

        if (recentDownloadData) {
          const typedDownloads: Download[] = recentDownloadData.map(download => ({
            id: download.id,
            user_id: download.user_id,
            product_id: download.product_id,
            created_at: download.created_at,
            order_id: download.order_id,
            title: download.title || '',
            downloaded_at: download.downloaded_at,
            user: download.user ? { email: download.user.email } : undefined,
            product: download.product ? { title: download.product.title } : undefined
          }));
          setRecentDownloads(typedDownloads);
        }

        // Fetch summary stats
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        const { data: downloadDataArr } = await supabase
          .from('order_items')
          .select('id')
          .not('downloaded_at', 'is', null);

        setSummary({
          totalOrders: orderCount ?? 0,
          totalRevenue: 0,
          totalUsers: userCount ?? 0,
          totalProducts: downloadDataArr?.length ?? 0,
        });

        // Fetch trend data for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: orderTrends } = await supabase
          .from('orders')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        const { data: userTrends } = await supabase
          .from('users')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        const { data: downloadTrends } = await supabase
          .from('order_items')
          .select('downloaded_at')
          .gte('downloaded_at', thirtyDaysAgo.toISOString())
          .not('downloaded_at', 'is', null);

        // Process trend data
        const dates = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const orderData = dates.map(date => 
          orderTrends?.filter(trend => trend.created_at.startsWith(date)).length ?? 0
        );
        const userData = dates.map(date => 
          userTrends?.filter(trend => trend.created_at.startsWith(date)).length ?? 0
        );
        const downloadCounts = dates.map(date => 
          downloadTrends?.filter(trend => trend.downloaded_at?.startsWith(date)).length ?? 0
        );

        setTrendData({
          labels: dates,
          datasets: [
            {
              label: 'Orders',
              data: orderData,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              tension: 0.4
            },
            {
              label: 'Users',
              data: userData,
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.5)',
              tension: 0.4
            },
            {
              label: 'Downloads',
              data: downloadCounts,
              borderColor: 'rgb(245, 158, 11)',
              backgroundColor: 'rgba(245, 158, 11, 0.5)',
              tension: 0.4
            }
          ]
        });

        // Fetch newsletter stats
        const { data: newsletterData } = await supabase
          .from('newsletter_subscribers')
          .select('total, confirmed, unconfirmed')
          .single();

        if (newsletterData) {
          setNewsletterStats({
            totalSubscribers: newsletterData.total ?? 0,
            activeSubscribers: newsletterData.confirmed ?? 0,
            unsubscribedCount: newsletterData.unconfirmed ?? 0,
            averageOpenRate: 0,
            averageClickRate: 0,
          });
        }
      } catch {
        setError("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsAndAnalytics();
  }, [refundPage, downloadPage]);

  const handleToggleRefunds = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: { enabled: !refundsEnabled } })
        .eq("key", "refunds_enabled");
      if (error) throw error;
      setRefundsEnabled((prev) => !prev);
      setSuccess("Refund setting updated.");
    } catch {
      setError("Failed to update refund setting.");
    } finally {
      setSaving(false);
    }
  };

  const handleResolveRefund = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', ticketId);
      if (error) throw error;
      setRefundRequests((prev) => prev.map((req) => req.id === ticketId ? { ...req, status: 'resolved', resolved_at: new Date().toISOString() } : req));
    } catch {
      alert('Failed to resolve refund request.');
    }
  };

  // Filtered refund requests
  const filteredRefundRequests = refundRequests.filter(req =>
    req.order_id?.toLowerCase().includes(refundSearch.toLowerCase()) ||
    req.user?.email?.toLowerCase().includes(refundSearch.toLowerCase()) ||
    req.user_id?.toLowerCase().includes(refundSearch.toLowerCase()) ||
    req.subject?.toLowerCase().includes(refundSearch.toLowerCase())
  );
  // Filtered downloads
  const filteredDownloads = recentDownloads.filter(dl =>
    dl.order_id?.toLowerCase().includes(downloadSearch.toLowerCase()) ||
    dl.user?.email?.toLowerCase().includes(downloadSearch.toLowerCase()) ||
    dl.user_id?.toLowerCase().includes(downloadSearch.toLowerCase()) ||
    dl.title?.toLowerCase().includes(downloadSearch.toLowerCase())
  );

  const openRefundCount = refundRequests.filter((req) => req.status !== 'resolved').length;

  function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string) {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csvRows = [
      keys.join(','),
      ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loadingUser) return <div>Loading...</div>;
  if (!user || user.user_metadata?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Admin Dashboard</h1>
        {trendData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">30-Day Trends</h2>
            <Line
              data={trendData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: false, text: 'Trends' },
                },
                scales: {
                  x: { title: { display: true, text: 'Date' } },
                  y: { title: { display: true, text: 'Count' }, beginAtZero: true },
                },
              }}
              height={120}
            />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-900">{summary.totalOrders ?? 0}</span>
            <span className="text-blue-700">Total Orders</span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-900">{summary.totalUsers ?? 0}</span>
            <span className="text-blue-700">Total Users</span>
          </div>
          <div className={`bg-white rounded-lg shadow p-4 flex flex-col items-center relative ${openRefundCount > 0 ? 'ring-2 ring-red-400' : ''}`}> 
            <span className="text-2xl font-bold text-blue-900">{summary.totalOrders ?? 0}</span>
            <span className="text-blue-700">Total Refunds</span>
            {openRefundCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-1">{openRefundCount} Open</span>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-900">{summary.totalProducts ?? 0}</span>
            <span className="text-blue-700">Total Downloads</span>
          </div>
        </div>
        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Newsletter Subscribers Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Newsletter</h3>
              <Link
                href="/admin/newsletter"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Subscribers</span>
                <span className="text-2xl font-bold text-blue-900">
                  {newsletterStats?.totalSubscribers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confirmed</span>
                <span className="text-xl font-semibold text-green-600">
                  {newsletterStats?.activeSubscribers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unconfirmed</span>
                <span className="text-xl font-semibold text-yellow-600">
                  {newsletterStats?.unsubscribedCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-blue-800 text-xl">Loading...</div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Refund Settings</h2>
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-900">Refunds Enabled:</span>
                <button
                  onClick={handleToggleRefunds}
                  disabled={saving}
                  className={`px-6 py-2 rounded font-semibold transition ${refundsEnabled ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-400 text-white"}`}
                >
                  {refundsEnabled ? "ON" : "OFF"}
                </button>
                {saving && <span className="text-blue-700 ml-2">Saving...</span>}
              </div>
              {error && <div className="text-red-600 mt-2">{error}</div>}
              {success && <div className="text-green-700 mt-2">{success}</div>}
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Analytics</h2>
              <div className="flex flex-col gap-2">
                <div>
                  <span className="font-medium">Total Refunds:</span> {analytics.totalOrders ?? 0}
                </div>
                <div>
                  <span className="font-medium">Total Downloads:</span> {analytics.totalProducts ?? 0}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Recent Refund Requests</h2>
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => exportToCSV(filteredRefundRequests, 'refund_requests.csv')}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
                >
                  Export CSV
                </button>
              </div>
              <input
                type="text"
                placeholder="Search by order, user, or subject..."
                value={refundSearch}
                onChange={e => setRefundSearch(e.target.value)}
                className="mb-2 px-3 py-2 border border-blue-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left">Order ID</th>
                      <th className="px-2 py-1 text-left">User ID</th>
                      <th className="px-2 py-1 text-left">User Email</th>
                      <th className="px-2 py-1 text-left">Subject</th>
                      <th className="px-2 py-1 text-left">Status</th>
                      <th className="px-2 py-1 text-left">Requested At</th>
                      <th className="px-2 py-1 text-left">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRefundRequests.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-2 text-gray-500">No refund requests found.</td></tr>
                    ) : (
                      filteredRefundRequests.map((req) => (
                        <tr key={req.id} className="border-b last:border-b-0">
                          <td className="px-2 py-1">{req.order_id}</td>
                          <td className="px-2 py-1">{req.user_id}</td>
                          <td className="px-2 py-1">{req.user?.email || req.user_id}</td>
                          <td className="px-2 py-1">{req.subject}</td>
                          <td className="px-2 py-1">{req.status}</td>
                          <td className="px-2 py-1">{req.created_at ? new Date(req.created_at).toLocaleString() : ''}</td>
                          <td className="px-2 py-1">
                            <a href={`/order-history/${req.order_id}`} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">View Order</a>
                            {req.user_id && (
                              <a
                                href={`/admin/user/${req.user_id}`}
                                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View User
                              </a>
                            )}
                            {req.status !== 'resolved' && (
                              <button
                                onClick={() => handleResolveRefund(req.id)}
                                className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => setRefundPage((p) => Math.max(1, p - 1))}
                    disabled={refundPage === 1}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-blue-900 font-medium">Page {refundPage}</span>
                  <button
                    onClick={() => setRefundPage((p) => p + 1)}
                    disabled={refundRequests.length < REFUND_PAGE_SIZE}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Recent Downloads</h2>
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => exportToCSV(filteredDownloads, 'downloads.csv')}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
                >
                  Export CSV
                </button>
              </div>
              <input
                type="text"
                placeholder="Search by order, user, or product..."
                value={downloadSearch}
                onChange={e => setDownloadSearch(e.target.value)}
                className="mb-2 px-3 py-2 border border-blue-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left">Order ID</th>
                      <th className="px-2 py-1 text-left">Product</th>
                      <th className="px-2 py-1 text-left">User ID</th>
                      <th className="px-2 py-1 text-left">User Email</th>
                      <th className="px-2 py-1 text-left">Downloaded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDownloads.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-2 text-gray-500">No downloads found.</td></tr>
                    ) : (
                      filteredDownloads.map((dl) => (
                        <tr key={dl.id} className="border-b last:border-b-0">
                          <td className="px-2 py-1">{dl.order_id}</td>
                          <td className="px-2 py-1">{dl.title}</td>
                          <td className="px-2 py-1">{dl.user_id || 'N/A'}</td>
                          <td className="px-2 py-1">
                            {dl.user?.email || dl.user_id || 'N/A'}
                            {dl.user_id && (
                              <a
                                href={`/admin/user/${dl.user_id}`}
                                className="ml-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View User
                              </a>
                            )}
                          </td>
                          <td className="px-2 py-1">{dl.downloaded_at ? new Date(dl.downloaded_at).toLocaleString() : ''}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => setDownloadPage((p) => Math.max(1, p - 1))}
                    disabled={downloadPage === 1}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-blue-900 font-medium">Page {downloadPage}</span>
                  <button
                    onClick={() => setDownloadPage((p) => p + 1)}
                    disabled={recentDownloads.length < DOWNLOAD_PAGE_SIZE}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 