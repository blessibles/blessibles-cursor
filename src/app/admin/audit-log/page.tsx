"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

interface AuditLogEntry {
  id: string;
  action_type: string;
  admin_user_id: string;
  target_user_id: string;
  details: Record<string, unknown>;
  created_at: string;
  admin?: {
    email: string;
    user_metadata: Record<string, unknown>;
  };
  user?: {
    email: string;
    user_metadata: Record<string, unknown>;
  };
}

export default function AdminAuditLogPage() {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const fetchAuditLog = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('admin_audit_log')
          .select('*, admin:admin_user_id(email, user_metadata), user:target_user_id(email, user_metadata)')
          .order('created_at', { ascending: false })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
        if (error) throw error;
        setAuditLog(data as AuditLogEntry[] || []);
      } catch {
        setError('Failed to load audit log.');
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLog();
  }, [page]);

  const filteredLog = auditLog.filter(log =>
    log.action_type?.toLowerCase().includes(search.toLowerCase()) ||
    log.admin?.email?.toLowerCase().includes(search.toLowerCase()) ||
    log.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    log.target_user_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Admin Audit Log</h1>
        <input
          type="text"
          placeholder="Search by action, admin, or user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4 px-3 py-2 border border-blue-300 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {loading ? (
          <div className="text-blue-800 text-xl">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-xl">{error}</div>
        ) : filteredLog.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 text-gray-500">No admin actions found.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Action</th>
                  <th className="px-2 py-1 text-left">Admin</th>
                  <th className="px-2 py-1 text-left">User</th>
                  <th className="px-2 py-1 text-left">Details</th>
                  <th className="px-2 py-1 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLog.map(log => (
                  <tr key={log.id} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{log.action_type}</td>
                    <td className="px-2 py-1">
                      {log.admin?.email ? (
                        <a href={`/admin/user/${log.admin_user_id}`} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">{log.admin.email}</a>
                      ) : log.admin_user_id}
                    </td>
                    <td className="px-2 py-1">
                      {log.user?.email ? (
                        <a href={`/admin/user/${log.target_user_id}`} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">{log.user.email}</a>
                      ) : log.target_user_id}
                    </td>
                    <td className="px-2 py-1">
                      <pre className="whitespace-pre-wrap text-xs bg-gray-100 rounded p-1">{JSON.stringify(log.details, null, 2)}</pre>
                    </td>
                    <td className="px-2 py-1">{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-blue-900 font-medium">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={auditLog.length < PAGE_SIZE}
                className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 