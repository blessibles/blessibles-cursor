"use client";
import React, { useEffect, useState } from "react";
import { use } from "react";
import { supabase } from '../../../../utils/supabaseClient';

interface User {
  id: string;
  email: string;
  user_metadata: {
    role?: string;
    active?: boolean;
    admin_notes?: string;
    name?: string;
  };
  created_at?: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
  payment_method?: string;
  shipping_address?: string;
  refunded_at?: string;
}

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  downloaded_at?: string;
}

interface UserAnalytics {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageOrderValue: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  category: string;
  priority: string;
  order_id?: string;
}

interface AuditLogEntry {
  id: string;
  action_type: string;
  details: Record<string, unknown>;
  created_at: string;
  admin_user_id: string;
  admin?: {
    email: string;
  };
}

export default function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0
  });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesSuccess, setNotesSuccess] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError) throw userError;
        if (userData) {
          const typedUser: User = {
            id: userData.id,
            email: userData.email || '',
            user_metadata: userData.user_metadata || {},
            created_at: userData.created_at
          };
          setUser(typedUser);
        }

        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        if (ordersData) {
          setOrders(ordersData as Order[]);
          const totalSpent = ordersData.reduce((sum: number, o: Order) => sum + (parseFloat(o.total.toString()) || 0), 0);
          const lastOrderDate = ordersData[0]?.created_at;
          setUserAnalytics({
            totalOrders: ordersData.length,
            totalSpent,
            lastOrderDate,
            averageOrderValue: totalSpent / (ordersData.length || 1)
          });
        }

        // Fetch support tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (ticketsError) throw ticketsError;
        if (ticketsData) {
          setTickets(ticketsData as SupportTicket[]);
        }

        // Fetch audit log
        const { data: auditData, error: auditError } = await supabase
          .from('admin_audit_log')
          .select('*, admin:admin_user_id(email)')
          .eq('target_user_id', userId)
          .order('created_at', { ascending: false });

        if (auditError) throw auditError;
        if (auditData) {
          setAuditLog(auditData as AuditLogEntry[]);
        }

        setLoading(false);
      } catch {
        setError('Failed to load user data.');
        setLoading(false);
      }
    };

    fetchUserData();

    // Fetch current admin user for audit logging
    const fetchAdminUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const typedAdminUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata || {},
          created_at: data.user.created_at
        };
        setAdminUser(typedAdminUser);
      }
    };
    fetchAdminUser();
  }, [userId]);

  async function logAdminAction(actionType: string, details: Record<string, unknown> = {}) {
    if (!adminUser || !user) return;
    await supabase.from('admin_audit_log').insert([
      {
        action_type: actionType,
        target_user_id: user.id,
        admin_user_id: adminUser.id,
        details,
      },
    ]);
  }

  const handleRoleChange = async (newRole: string) => {
    if (!user) return;
    setRoleSaving(true);
    setRoleError(null);
    setRoleSuccess(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({ user_metadata: { ...user.user_metadata, role: newRole } })
        .eq('id', user.id);
      if (error) throw error;
      setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, role: newRole } } : null);
      setRoleSuccess('User role updated successfully.');
      await logAdminAction('update_role', { userId: user.id, newRole });
    } catch {
      setRoleError('Failed to update user role.');
    } finally {
      setRoleSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    setDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({ user_metadata: { ...user.user_metadata, active: false } })
        .eq('id', user.id);
      if (error) throw error;
      setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, active: false } } : null);
      setDeleteSuccess('User deactivated successfully.');
      await logAdminAction('deactivate_user', { userId: user.id });
    } catch {
      setDeleteError('Failed to deactivate user.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!user) return;
    setEmailSending(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      const { error } = await supabase.functions.invoke('send-admin-email', {
        body: { userId: user.id }
      });
      if (error) throw error;
      setEmailSuccess('Email sent successfully.');
      await logAdminAction('send_email', { userId: user.id });
    } catch {
      setEmailError('Failed to send email.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!user) return;
    setNotesSaving(true);
    setNotesError(null);
    setNotesSuccess(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({ user_metadata: { ...user.user_metadata, admin_notes: adminNotes } })
        .eq('id', user.id);
      if (error) throw error;
      setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, admin_notes: adminNotes } } : null);
      setNotesSuccess('Notes saved successfully.');
      await logAdminAction('update_notes', { userId: user.id });
    } catch {
      setNotesError('Failed to save notes.');
    } finally {
      setNotesSaving(false);
    }
  };

  if (loading) return <div className="text-blue-800 text-xl">Loading...</div>;
  if (error) return <div className="text-red-600 text-xl">{error}</div>;
  if (!user) return <div className="text-red-600 text-xl">User not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">User Details</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-2"><span className="font-medium">User ID:</span> {user.id}</div>
          <div className="mb-2"><span className="font-medium">Email:</span> {user.email}</div>
          <div className="mb-2"><span className="font-medium">Name:</span> {user.user_metadata?.name || 'N/A'}</div>
          <div className="mb-2"><span className="font-medium">Role:</span> {user.user_metadata?.role || 'user'}
            <select
              value={user.user_metadata?.role || 'user'}
              onChange={e => handleRoleChange(e.target.value)}
              disabled={roleSaving}
              className="ml-2 px-2 py-1 border border-blue-300 rounded"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            {roleSaving && <span className="ml-2 text-blue-700">Saving…</span>}
            {roleError && <span className="ml-2 text-red-600">{roleError}</span>}
            {roleSuccess && <span className="ml-2 text-green-700">{roleSuccess}</span>}
          </div>
          <div className="mb-2"><span className="font-medium">Created At:</span> {user.created_at ? new Date(user.created_at).toLocaleString() : ''}</div>
          <div className="mb-2"><span className="font-medium">Last Login:</span> {userAnalytics.lastOrderDate ? new Date(userAnalytics.lastOrderDate).toLocaleString() : 'N/A'}</div>
          <div className="mb-2"><span className="font-medium">Total Spent:</span> ${userAnalytics.totalSpent?.toFixed(2) ?? '0.00'}</div>
          <div className="mb-2"><span className="font-medium">Average Order Value:</span> ${userAnalytics.averageOrderValue?.toFixed(2) ?? '0.00'}</div>
          <div className="mb-2"><span className="font-medium">Number of Orders:</span> {userAnalytics.totalOrders ?? 0}</div>
          <div className="mb-2"><span className="font-medium">Last Order Date:</span> {userAnalytics.lastOrderDate ? new Date(userAnalytics.lastOrderDate).toLocaleDateString() : 'N/A'}</div>
          <div className="mb-4">
            <label className="block font-medium text-blue-800 mb-1">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 h-24"
              placeholder="Add internal notes about this user..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={notesSaving}
              className="mt-2 bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50"
            >
              {notesSaving ? 'Saving…' : 'Save Notes'}
            </button>
            {notesError && <div className="text-red-600 mt-2">{notesError}</div>}
            {notesSuccess && <div className="text-green-700 mt-2">{notesSuccess}</div>}
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleDeactivate}
              disabled={deleting || user.user_metadata?.active === false}
              className="bg-yellow-600 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-700 transition disabled:opacity-50"
            >
              {user.user_metadata?.active === false ? 'User Deactivated' : 'Deactivate User'}
            </button>
            <button
              onClick={handleSendEmail}
              disabled={emailSending}
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {emailSending ? 'Sending…' : 'Resend Email'}
            </button>
          </div>
          {deleteError && <div className="text-red-600 mt-2">{deleteError}</div>}
          {deleteSuccess && <div className="text-green-700 mt-2">{deleteSuccess}</div>}
          {emailError && <div className="text-red-600 mt-2">{emailError}</div>}
          {emailSuccess && <div className="text-green-700 mt-2">{emailSuccess}</div>}
        </div>
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Order History</h2>
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 text-gray-500">No orders found for this user.</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-800">Order #{order.id}</span>
                <span className="text-gray-600 text-sm">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</span>
              </div>
              <div className="mb-2"><span className="font-medium">Status:</span> {order.status}</div>
              <div className="mb-2"><span className="font-medium">Total:</span> {order.total}</div>
              <div className="mb-2"><span className="font-medium">Payment Method:</span> {order.payment_method}</div>
              <div className="mb-2"><span className="font-medium">Shipping Address:</span> {order.shipping_address}</div>
              <div className="mb-2"><span className="font-medium">Refunded At:</span> {order.refunded_at ? new Date(order.refunded_at).toLocaleString() : 'N/A'}</div>
              <div className="mb-2"><span className="font-medium">Order Items:</span></div>
              <ul className="list-disc ml-6">
                {order.order_items.map((item: OrderItem) => (
                  <li key={item.id}>
                    {item.title} (Qty: {item.quantity}) - {item.price}
                    {item.downloaded_at && (
                      <span className="ml-2 text-green-700 text-xs">Downloaded: {new Date(item.downloaded_at).toLocaleString()}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Support Ticket History</h2>
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 text-gray-500 mb-6">No support tickets found for this user.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Subject</th>
                  <th className="px-2 py-1 text-left">Category</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Created At</th>
                  <th className="px-2 py-1 text-left">Order</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{ticket.subject}</td>
                    <td className="px-2 py-1">{ticket.category}</td>
                    <td className="px-2 py-1">{ticket.status}</td>
                    <td className="px-2 py-1">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ''}</td>
                    <td className="px-2 py-1">
                      {ticket.order_id ? (
                        <a href={`/order-history/${ticket.order_id}`} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">View Order</a>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Admin Audit Log</h2>
        {auditLog.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 text-gray-500 mb-6">No admin actions found for this user.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Action</th>
                  <th className="px-2 py-1 text-left">Admin</th>
                  <th className="px-2 py-1 text-left">Details</th>
                  <th className="px-2 py-1 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map(log => (
                  <tr key={log.id} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{log.action_type}</td>
                    <td className="px-2 py-1">{log.admin?.email || log.admin_user_id}</td>
                    <td className="px-2 py-1">
                      <pre className="whitespace-pre-wrap text-xs bg-gray-100 rounded p-1">{JSON.stringify(log.details, null, 2)}</pre>
                    </td>
                    <td className="px-2 py-1">{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 