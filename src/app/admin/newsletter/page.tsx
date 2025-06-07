"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  confirmed: boolean;
  unsubscribed: boolean;
  unsubscribed_at: string | null;
}

interface TrendPoint {
  date: string;
  count: number;
}

interface Trends {
  newSubscribers: TrendPoint[];
  confirmedSubscribers: TrendPoint[];
  unsubscribes: TrendPoint[];
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, confirmed, unconfirmed, unsubscribed
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;
  const [trends, setTrends] = useState<Trends | null>(null);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [trendRange, setTrendRange] = useState(30); // 7, 14, 30

  useEffect(() => {
    fetchSubscribers();
    fetchTrends();
  }, [page, trendRange]);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (error) throw error;
      setSubscribers(data || []);
    } catch {
      setError('Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    setTrendLoading(true);
    setTrendError(null);
    try {
      const res = await fetch('/api/admin/newsletter/stats');
      const data: { trends?: Trends } = await res.json();
      if (data.trends) {
        setTrends(data.trends);
      } else {
        setTrendError('No trend data available.');
      }
    } catch {
      setTrendError('Failed to load trend analytics.');
    } finally {
      setTrendLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'confirmed' ? sub.confirmed && !sub.unsubscribed :
      filter === 'unconfirmed' ? !sub.confirmed && !sub.unsubscribed :
      filter === 'unsubscribed' ? sub.unsubscribed : true;
    
    return matchesSearch && matchesFilter;
  });

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Email', 'Status', 'Subscribed Date', 'Unsubscribed Date'];
      const csvRows = [
        headers.join(','),
        ...data.map(sub => [
          sub.email,
          sub.unsubscribed ? 'Unsubscribed' : (sub.confirmed ? 'Confirmed' : 'Unconfirmed'),
          new Date(sub.created_at).toLocaleDateString(),
          sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString() : ''
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvRows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export subscribers.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Newsletter Subscribers</h1>
          <button
            onClick={handleExport}
            className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition"
          >
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Subscribers</option>
              <option value="confirmed">Confirmed</option>
              <option value="unconfirmed">Unconfirmed</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>

          {loading ? (
            <div className="text-blue-800 text-xl">Loading...</div>
          ) : error ? (
            <div className="text-red-600 text-xl">{error}</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No subscribers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Subscribed Date</th>
                    <th className="px-4 py-2 text-left">Unsubscribed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub: Subscriber) => (
                    <tr key={sub.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2">{sub.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold
                          ${sub.unsubscribed ? 'bg-red-100 text-red-800' :
                            sub.confirmed ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'}`}
                        >
                          {sub.unsubscribed ? 'Unsubscribed' :
                           sub.confirmed ? 'Confirmed' : 'Unconfirmed'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {sub.unsubscribed_at ? 
                          new Date(sub.unsubscribed_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-blue-900 font-medium">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={subscribers.length < PAGE_SIZE}
              className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-blue-800">Subscription Trends</h2>
            <select
              value={trendRange}
              onChange={e => setTrendRange(Number(e.target.value))}
              className="px-2 py-1 border border-blue-200 rounded"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          {trendLoading ? (
            <div className="text-blue-800">Loading chart...</div>
          ) : trendError ? (
            <div className="text-red-600">{trendError}</div>
          ) : trends ? (
            <Line
              data={{
                labels: trends.newSubscribers.slice(-trendRange).map((d) => d.date),
                datasets: [
                  {
                    label: 'New Subscribers',
                    data: trends.newSubscribers.slice(-trendRange).map((d) => d.count),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37,99,235,0.1)',
                    tension: 0.3,
                  },
                  {
                    label: 'Confirmed',
                    data: trends.confirmedSubscribers.slice(-trendRange).map((d) => d.count),
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22,163,74,0.1)',
                    tension: 0.3,
                  },
                  {
                    label: 'Unsubscribes',
                    data: trends.unsubscribes.slice(-trendRange).map((d) => d.count),
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220,38,38,0.1)',
                    tension: 0.3,
                  },
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: false }
                },
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
              }}
              height={80}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
} 