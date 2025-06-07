"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

interface CampaignEvent {
  subscriber_email: string;
  event_type: string;
  url?: string;
  created_at?: string;
}

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number>(0);
  const [openCount, setOpenCount] = useState<number>(0);
  const [clickCount, setClickCount] = useState<number>(0);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [subscriberEvents, setSubscriberEvents] = useState<{ email: string; opens: number; clicks: number }[]>([]);
  const [urlClicks, setUrlClicks] = useState<{ url: string; count: number }[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [timeSeries, setTimeSeries] = useState<{ date: string; opens: number; clicks: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
    if (!campaignId) return;
    fetchAnalytics();
    fetchTimeSeries();
    // eslint-disable-next-line
  }, [campaignId]);

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("newsletter_campaigns")
        .select("subject, content, status, scheduled_for, sent_count, open_count, click_count, error")
        .eq("id", campaignId)
        .single();
      if (error || !data) throw error;
      setSubject(data.subject || "");
      setContent(data.content || "");
      setStatus(data.status || "draft");
      setScheduledFor(data.scheduled_for ? new Date(data.scheduled_for).toISOString().slice(0, 16) : "");
      setSentCount(data.sent_count || 0);
      setOpenCount(data.open_count || 0);
      setClickCount(data.click_count || 0);
      setErrorLog(data.error || null);
    } catch {
      setError("Failed to load campaign.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      // Per-subscriber open/click counts
      const { data: events, error } = await supabase
        .from('newsletter_campaign_events')
        .select('subscriber_email, event_type, url')
        .eq('campaign_id', campaignId);
      if (error) throw error;
      // Aggregate per-subscriber
      const subMap: Record<string, { opens: number; clicks: number }> = {};
      const urlMap: Record<string, number> = {};
      for (const e of (events as CampaignEvent[])) {
        if (!subMap[e.subscriber_email]) subMap[e.subscriber_email] = { opens: 0, clicks: 0 };
        if (e.event_type === 'open') subMap[e.subscriber_email].opens++;
        if (e.event_type === 'click') subMap[e.subscriber_email].clicks++;
        if (e.event_type === 'click' && e.url) {
          urlMap[e.url] = (urlMap[e.url] || 0) + 1;
        }
      }
      setSubscriberEvents(
        Object.entries(subMap).map(([email, v]) => ({ email, ...v }))
      );
      setUrlClicks(
        Object.entries(urlMap)
          .map(([url, count]) => ({ url, count }))
          .sort((a, b) => b.count - a.count)
      );
    } catch {
      setAnalyticsError('Failed to load detailed analytics.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchTimeSeries = async () => {
    setChartLoading(true);
    setChartError(null);
    try {
      const { data: events, error } = await supabase
        .from('newsletter_campaign_events')
        .select('created_at, event_type')
        .eq('campaign_id', campaignId);
      if (error) throw error;
      // Group by day
      const dayMap: Record<string, { opens: number; clicks: number }> = {};
      for (const e of (events as CampaignEvent[])) {
        if (!e.created_at) continue;
        const day = e.created_at.slice(0, 10);
        if (!dayMap[day]) dayMap[day] = { opens: 0, clicks: 0 };
        if (e.event_type === 'open') dayMap[day].opens++;
        if (e.event_type === 'click') dayMap[day].clicks++;
      }
      const days = Object.keys(dayMap).sort();
      setTimeSeries(days.map(d => ({ date: d, ...dayMap[d] })));
    } catch {
      setChartError('Failed to load time series data.');
    } finally {
      setChartLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (!subject.trim() || !content.trim()) {
        setError("Subject and content are required.");
        setSaving(false);
        return;
      }
      let scheduled_for = null;
      if (status === "scheduled" && scheduledFor) {
        scheduled_for = new Date(scheduledFor).toISOString();
      }
      const { error } = await supabase
        .from("newsletter_campaigns")
        .update({ subject, content, status, scheduled_for })
        .eq("id", campaignId);
      if (error) throw error;
      setSuccess("Campaign updated successfully!");
      setTimeout(() => router.push("/admin/newsletter/campaigns"), 1200);
    } catch {
      setError("Failed to update campaign.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    setSending(true);
    setSendError(null);
    setSendSuccess(null);
    try {
      const res = await fetch('/api/admin/newsletter/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send campaign');
      setSendSuccess(data.message);
      fetchCampaign(); // Refresh status
    } catch {
      let errorMsg = 'Failed to send campaign';
      setSendError(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { error } = await supabase.from('newsletter_campaigns').delete().eq('id', campaignId);
      if (error) throw error;
      router.push('/admin/newsletter/campaigns');
    } catch {
      setDeleteError('Failed to delete campaign.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    setDuplicateError(null);
    try {
      const { data, error } = await supabase.from('newsletter_campaigns').insert([
        {
          subject: subject + ' (Copy)',
          content,
          status: 'draft',
        },
      ]).select('id').single();
      if (error || !data) throw error;
      router.push(`/admin/newsletter/campaigns/${data.id}`);
    } catch {
      setDuplicateError('Failed to duplicate campaign.');
    } finally {
      setDuplicating(false);
    }
  };

  const handleExportAnalytics = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Sent', sentCount],
      ['Opens', openCount],
      ['Open Rate', sentCount > 0 ? `${Math.round((openCount / sentCount) * 100)}%` : '0%'],
      ['Clicks', clickCount],
      ['Click Rate', sentCount > 0 ? `${Math.round((clickCount / sentCount) * 100)}%` : '0%'],
    ];
    if (errorLog) {
      rows.push(['Error Log', errorLog.replace(/\n/g, ' ')]);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-analytics-${campaignId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Edit Newsletter Campaign</h1>
        {/* Send Now Button */}
        {!loading && !error && (status === 'draft' || status === 'scheduled') && (
          <div className="mb-6">
            <button
              onClick={handleSendNow}
              className="bg-green-700 text-white px-6 py-2 rounded font-semibold hover:bg-green-800 transition disabled:opacity-50 mr-2"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Now'}
            </button>
            {sendError && <span className="text-red-600 ml-4">{sendError}</span>}
            {sendSuccess && <span className="text-green-700 ml-4">{sendSuccess}</span>}
          </div>
        )}
        {/* Delete Button */}
        {!loading && !error && (status === 'draft' || status === 'scheduled' || status === 'failed') && (
          <div className="mb-6">
            <button
              onClick={handleDelete}
              className="bg-red-700 text-white px-6 py-2 rounded font-semibold hover:bg-red-800 transition disabled:opacity-50"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Campaign'}
            </button>
            {deleteError && <span className="text-red-600 ml-4">{deleteError}</span>}
          </div>
        )}
        {/* Duplicate Button */}
        {!loading && !error && (
          <div className="mb-6">
            <button
              onClick={handleDuplicate}
              className="bg-gray-700 text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition disabled:opacity-50 mr-2"
              disabled={duplicating}
            >
              {duplicating ? 'Duplicating...' : 'Duplicate'}
            </button>
            {duplicateError && <span className="text-red-600 ml-4">{duplicateError}</span>}
          </div>
        )}
        {loading ? (
          <div className="text-blue-800 text-xl">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-xl">{error}</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block font-semibold mb-1 text-blue-800">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-blue-800">Content (HTML)</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[180px] font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">You can use HTML for formatting. A rich text editor will be added soon.</p>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-blue-800">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {status === "scheduled" && (
              <div>
                <label className="block font-semibold mb-1 text-blue-800">Scheduled For</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required={status === "scheduled"}
                />
              </div>
            )}
            {error && <div className="text-red-600 font-semibold">{error}</div>}
            {success && <div className="text-green-700 font-semibold">{success}</div>}
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
        {/* Live HTML Preview */}
        {!loading && !error && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Live Preview</h2>
            <div className="border border-blue-200 rounded p-4 bg-blue-50 min-h-[120px]">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        )}
        {/* Analytics Section */}
        {!loading && !error && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Analytics</h2>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="flex flex-wrap gap-6 mb-2">
                <div>
                  <span className="font-semibold text-blue-900">Sent:</span> {sentCount}
                </div>
                <div>
                  <span className="font-semibold text-blue-900">Opens:</span> {openCount} {sentCount > 0 && `(${Math.round((openCount / sentCount) * 100)}%)`}
                </div>
                <div>
                  <span className="font-semibold text-blue-900">Clicks:</span> {clickCount} {sentCount > 0 && `(${Math.round((clickCount / sentCount) * 100)}%)`}
                </div>
              </div>
              <button
                onClick={handleExportAnalytics}
                className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition mb-2"
              >
                Export Analytics
              </button>
              {errorLog && (
                <div className="mt-2">
                  <span className="font-semibold text-red-700">Error Log:</span>
                  <pre className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800 overflow-x-auto mt-1">{errorLog}</pre>
                </div>
              )}
              {/* Detailed Analytics */}
              <div className="mt-6">
                <h3 className="font-semibold text-blue-800 mb-2">Per-Subscriber Engagement</h3>
                {analyticsLoading ? (
                  <div className="text-blue-800">Loading...</div>
                ) : analyticsError ? (
                  <div className="text-red-600">{analyticsError}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left">Subscriber Email</th>
                          <th className="px-2 py-1 text-left">Opens</th>
                          <th className="px-2 py-1 text-left">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriberEvents.map(sub => (
                          <tr key={sub.email} className="border-b last:border-b-0">
                            <td className="px-2 py-1 font-mono">{sub.email}</td>
                            <td className="px-2 py-1">{sub.opens}</td>
                            <td className="px-2 py-1">{sub.clicks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <h3 className="font-semibold text-blue-800 mb-2">Top Clicked URLs</h3>
                {analyticsLoading ? (
                  <div className="text-blue-800">Loading...</div>
                ) : analyticsError ? (
                  <div className="text-red-600">{analyticsError}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-1 text-left">URL</th>
                          <th className="px-2 py-1 text-left">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {urlClicks.map(row => (
                          <tr key={row.url} className="border-b last:border-b-0">
                            <td className="px-2 py-1 font-mono break-all max-w-xs">{row.url}</td>
                            <td className="px-2 py-1">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {/* Time Series Chart */}
              <div className="mt-6">
                <h3 className="font-semibold text-blue-800 mb-2">Opens & Clicks Over Time</h3>
                {chartLoading ? (
                  <div className="text-blue-800">Loading chart...</div>
                ) : chartError ? (
                  <div className="text-red-600">{chartError}</div>
                ) : timeSeries.length === 0 ? (
                  <div className="text-gray-500">No event data yet.</div>
                ) : (
                  <Line
                    data={{
                      labels: timeSeries.map(d => d.date),
                      datasets: [
                        {
                          label: 'Opens',
                          data: timeSeries.map(d => d.opens),
                          borderColor: '#2563eb',
                          backgroundColor: 'rgba(37,99,235,0.1)',
                          tension: 0.3,
                        },
                        {
                          label: 'Clicks',
                          data: timeSeries.map(d => d.clicks),
                          borderColor: '#16a34a',
                          backgroundColor: 'rgba(22,163,74,0.1)',
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 