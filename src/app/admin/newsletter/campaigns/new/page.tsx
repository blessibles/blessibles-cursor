"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function NewCampaignPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!subject.trim() || !content.trim()) {
        setError("Subject and content are required.");
        setLoading(false);
        return;
      }
      let scheduled_for = null;
      if (status === "scheduled" && scheduledFor) {
        scheduled_for = new Date(scheduledFor).toISOString();
      }
      const { error } = await supabase.from("newsletter_campaigns").insert([
        {
          subject,
          content,
          status,
          scheduled_for,
        },
      ]);
      if (error) throw error;
      setSuccess("Campaign created successfully!");
      setTimeout(() => router.push("/admin/newsletter/campaigns"), 1200);
    } catch {
      setError("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">New Newsletter Campaign</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading}
          >
            {loading ? "Saving..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
} 