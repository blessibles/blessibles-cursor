"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";

type Campaign = {
  id: string;
  created_at: string;
  updated_at: string;
  subject: string;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  sent_count: number;
  open_count: number;
  click_count: number;
  error: string | null;
};

export default function AdminNewsletterCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("newsletter_campaigns")
        .select("id, created_at, updated_at, subject, status, scheduled_for, sent_at, sent_count, open_count, click_count, error")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCampaigns(data || []);
    } catch {
      setError("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      const { error } = await supabase.from('newsletter_campaigns').delete().eq('id', id);
      if (error) throw error;
      fetchCampaigns();
    } catch {
      setDeleteError('Failed to delete campaign.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Newsletter Campaigns</h1>
          <Link
            href="/admin/newsletter/campaigns/new"
            className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition"
          >
            New Campaign
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          {loading ? (
            <div className="text-blue-800 text-xl">Loading...</div>
          ) : error ? (
            <div className="text-red-600 text-xl">{error}</div>
          ) : campaigns.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No campaigns found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Scheduled For</th>
                    <th className="px-4 py-2 text-left">Sent At</th>
                    <th className="px-4 py-2 text-left">Sent</th>
                    <th className="px-4 py-2 text-left">Opens</th>
                    <th className="px-4 py-2 text-left">Clicks</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-b last:border-b-0">
                      <td className="px-4 py-2 font-medium text-blue-900">{c.subject}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold
                          ${c.status === 'sent' ? 'bg-green-100 text-green-800' :
                            c.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            c.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                            c.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">{c.scheduled_for ? new Date(c.scheduled_for).toLocaleString() : '-'}</td>
                      <td className="px-4 py-2">{c.sent_at ? new Date(c.sent_at).toLocaleString() : '-'}</td>
                      <td className="px-4 py-2">{c.sent_count}</td>
                      <td className="px-4 py-2">{c.sent_count > 0 ? `${c.open_count} (${Math.round((c.open_count / c.sent_count) * 100)}%)` : c.open_count}</td>
                      <td className="px-4 py-2">{c.sent_count > 0 ? `${c.click_count} (${Math.round((c.click_count / c.sent_count) * 100)}%)` : c.click_count}</td>
                      <td className="px-4 py-2 space-x-2">
                        <Link
                          href={`/admin/newsletter/campaigns/${c.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          Edit
                        </Link>
                        {(c.status === 'draft' || c.status === 'scheduled' || c.status === 'failed') && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-red-700 hover:underline disabled:opacity-50"
                            disabled={deletingId === c.id}
                          >
                            {deletingId === c.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {deleteError && <div className="text-red-600 font-semibold mt-4">{deleteError}</div>}
      </div>
    </div>
  );
} 