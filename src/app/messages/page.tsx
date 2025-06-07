"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

interface Member {
  id: string;
  name: string;
  avatar: string;
}

interface ConversationMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  date: string;
}

export default function MessagesPage() {
  // Mock auth: assume user is logged in
  const isLoggedIn = true;
  const user = { id: 'mock-user', name: 'You', avatar: '/avatars/avatar1.png' }; // Replace with real user from auth
  // For demo, use a static member list
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Sarah M.', avatar: '/avatars/avatar1.png' },
    { id: '2', name: 'John D.', avatar: '/avatars/avatar2.png' },
    { id: '3', name: 'Emily R.', avatar: '/avatars/avatar3.png' },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('date', { ascending: true });
      if (error) {
        setError('Failed to load messages.');
        setMessages([]);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };
    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !selected) return;
    setSubmitting(true);
    setError('');
    const { error } = await supabase.from('messages').insert([
      {
        from: user.id,
        to: selected,
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
        .from('messages')
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
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Messages</h1>
          <p className="mb-4 text-blue-700">Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to view your messages.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Messages</h1>
      <div className="w-full max-w-4xl flex gap-8">
        {/* Conversation List */}
        <div className="w-1/3 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Inbox</h2>
          {loading ? (
            <div className="text-blue-700">Loading conversations...</div>
          ) : (
            <ul>
              {members.map((member) => (
                <li
                  key={member.id}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer mb-2 hover:bg-blue-50 ${selected === member.id ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelected(member.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select conversation with ${member.name}`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(member.id);
                    }
                  }}
                >
                  <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-blue-200" />
                  <span className="text-blue-900 font-medium">{member.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Message Thread */}
        <div className="flex-1">
          {selected === null ? (
            <div className="text-blue-700">Select a conversation to view messages.</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 400 }}>
                {messages.filter((msg) =>
                  (msg.from === user.id && msg.to === selected) ||
                  (msg.from === selected && msg.to === user.id)
                ).map((msg) => (
                  <div key={msg.id} className={`mb-3 flex ${msg.from === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.from === user.id ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-900'}`}>
                      <div>{msg.text}</div>
                      <div className="text-xs mt-1 text-blue-200/80 text-right">{msg.date}</div>
                    </div>
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