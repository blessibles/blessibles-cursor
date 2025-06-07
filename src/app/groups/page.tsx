"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

interface Group {
  id: string;
  name: string;
  description: string;
}

interface GroupMessage {
  id: string;
  group_id: string;
  author: string;
  text: string;
  date: string;
}

export default function GroupsPage() {
  // Mock auth: assume user is logged in
  const isLoggedIn = true;
  const user = { id: 'mock-user', name: 'You' }; // Replace with real user from auth
  const [selected, setSelected] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      const [{ data: gData, error: gError }, { data: mData, error: mError }] = await Promise.all([
        supabase.from('groups').select('*').order('name', { ascending: true }),
        supabase.from('group_messages').select('*').order('date', { ascending: true }),
      ]);
      if (gError || mError) {
        setError('Failed to load groups or messages.');
        setGroups([]);
        setMessages([]);
      } else {
        setGroups(gData || []);
        setMessages(mData || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !selected) return;
    setSubmitting(true);
    setError('');
    const { error } = await supabase.from('group_messages').insert([
      {
        group_id: selected,
        author: user.name,
        text: newMessage,
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
    if (error) {
      setError('Failed to send message.');
    } else {
      setNewMessage('');
      // Re-fetch messages
      const { data } = await supabase
        .from('group_messages')
        .select('*')
        .order('date', { ascending: true });
      setMessages(data || []);
    }
    setSubmitting(false);
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Groups</h1>
          <p className="mb-4 text-blue-700">Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to view and join groups.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Group Discussions</h1>
      <div className="w-full max-w-4xl flex gap-8">
        {/* Group List */}
        <div className="w-1/3 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Groups</h2>
          {loading ? (
            <div className="text-blue-700">Loading groups...</div>
          ) : (
            <ul>
              {groups.map((group) => (
                <li
                  key={group.id}
                  className={`p-3 rounded cursor-pointer mb-2 hover:bg-blue-50 ${selected === group.id ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelected(group.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select group ${group.name}`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(group.id);
                    }
                  }}
                >
                  <div className="text-blue-900 font-semibold">{group.name}</div>
                  <div className="text-blue-700 text-xs">{group.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Group Thread */}
        <div className="flex-1">
          {selected === null ? (
            <div className="text-blue-700">Select a group to view the discussion.</div>
          ) : (
            <>
              <div className="overflow-y-auto mb-4" style={{ maxHeight: 400 }}>
                {messages.filter((msg) => msg.group_id === selected).map((msg, idx) => (
                  <div key={msg.id} className="mb-3">
                    <div className="font-semibold text-blue-800">{msg.author}</div>
                    <div className="bg-blue-100 text-blue-900 rounded px-4 py-2 inline-block mt-1">{msg.text}</div>
                    <div className="text-xs text-blue-500 mt-1">{msg.date}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  aria-label="Message"
                  className="flex-1 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  disabled={submitting}
                />
                <button
                  className="bg-blue-700 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || submitting}
                >
                  {submitting ? 'Sending...' : 'Send'}
                </button>
              </div>
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </>
          )}
        </div>
      </div>
    </main>
  );
} 