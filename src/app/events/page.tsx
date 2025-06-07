"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  rsvps: number;
}

export default function EventsPage() {
  // Mock auth: assume user is logged in
  const isLoggedIn = true;
  const user = { id: 'mock-user', name: 'You' }; // Replace with real user from auth
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvped, setRsvped] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) {
        setError('Failed to load events.');
        setEvents([]);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleRsvp = async (id: string) => {
    setSubmitting(true);
    setError('');
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const { error } = await supabase
      .from('events')
      .update({ rsvps: event.rsvps + 1 })
      .eq('id', id);
    if (error) {
      setError('Failed to RSVP.');
    } else {
      setRsvped((prev) => [...prev, id]);
      // Re-fetch events
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      setEvents(data || []);
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Events</h1>
      <div className="w-full max-w-2xl">
        {loading ? (
          <div className="text-blue-700">Loading events...</div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="mb-2">
                <span className="font-semibold text-blue-900">{event.title}</span>
              </div>
              <div className="text-xs text-blue-600 mb-2">{event.date}</div>
              <div className="mb-2 text-blue-800">{event.description}</div>
              <div className="flex items-center gap-2">
                <button
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 font-semibold"
                  onClick={() => handleRsvp(event.id)}
                  disabled={rsvped.includes(event.id) || submitting}
                >
                  {rsvped.includes(event.id) ? 'RSVPed' : 'RSVP'}
                </button>
                <span className="text-blue-700 text-sm">{event.rsvps} RSVP</span>
              </div>
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </div>
          ))
        )}
      </div>
    </main>
  );
} 