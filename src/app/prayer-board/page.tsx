"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

interface PrayerRequest {
  id: string;
  name: string;
  request: string;
  date: string;
  prayedFor: number;
}

export default function PrayerBoardPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [prayedMessage, setPrayedMessage] = useState('');
  // Mock auth: assume user is logged in
  const isLoggedIn = true;
  const user = { id: 'mock-user', name: 'You' }; // Replace with real user from auth

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        setError('Failed to load prayer requests.');
        setRequests([]);
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    const { error } = await supabase.from('prayer_requests').insert([
      {
        name: user.name,
        request: newRequest,
        date: new Date().toISOString().slice(0, 10),
        prayedFor: 0,
      },
    ]);
    if (error) {
      setError('Failed to post prayer request.');
    } else {
      setNewRequest('');
      setSuccessMessage('Your prayer request has been submitted!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Re-fetch requests
      const { data } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('date', { ascending: false });
      setRequests(data || []);
    }
    setSubmitting(false);
  };

  const handlePrayedFor = async (id: string) => {
    setError('');
    setPrayedMessage('');
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const { error } = await supabase
      .from('prayer_requests')
      .update({ prayedFor: req.prayedFor + 1 })
      .eq('id', id);
    if (error) {
      setError('Failed to update prayer count.');
    } else {
      setPrayedMessage('Thank you for praying!');
      setTimeout(() => setPrayedMessage(''), 2000);
      // Re-fetch requests
      const { data } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('date', { ascending: false });
      setRequests(data || []);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Prayer Request Board</h1>
      {successMessage && <div className="mb-4 text-green-700 font-semibold">{successMessage}</div>}
      {prayedMessage && <div className="mb-4 text-green-700 font-semibold">{prayedMessage}</div>}
      <div className="w-full max-w-2xl">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="mb-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Submit a Prayer Request</h3>
            <textarea
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              placeholder="Type your prayer request here..."
              required
              className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[60px]"
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition mt-2"
              disabled={submitting || !newRequest.trim()}
            >
              {submitting ? 'Posting...' : 'Post Request'}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        ) : (
          <div className="mb-8 bg-blue-50 p-4 rounded-lg text-blue-700 text-center">
            Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to submit a prayer request.
          </div>
        )}
        {loading ? (
          <div className="text-blue-700">Loading prayer requests...</div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="mb-2">
                <span className="font-semibold text-blue-900">{r.name}:</span> {r.request}
              </div>
              <div className="text-xs text-blue-600 mb-2">Posted on {r.date}</div>
              <div className="flex items-center gap-2">
                <button
                  className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 font-semibold"
                  onClick={() => handlePrayedFor(r.id)}
                  disabled={!isLoggedIn}
                >
                  I Prayed
                </button>
                <span className="text-blue-700 text-sm">{r.prayedFor} prayed</span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
} 