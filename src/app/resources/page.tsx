"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  postedBy: string;
  date: string;
}

export default function ResourcesPage() {
  // Mock auth: assume user is logged in
  const isLoggedIn = true;
  const user = { id: 'mock-user', name: 'You' }; // Replace with real user from auth
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('file');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        setError('Failed to load resources.');
        setResources([]);
      } else {
        setResources(data || []);
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error } = await supabase.from('resources').insert([
      {
        title,
        type,
        url,
        postedBy: user.name,
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
    if (error) {
      setError('Failed to share resource.');
    } else {
      setTitle('');
      setUrl('');
      setType('file');
      // Re-fetch resources
      const { data } = await supabase
        .from('resources')
        .select('*')
        .order('date', { ascending: false });
      setResources(data || []);
    }
    setSubmitting(false);
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Resource Sharing Board</h1>
          <p className="mb-4 text-blue-700">Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to view and share resources.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Resource Sharing Board</h1>
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="mb-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">Share a Resource</h3>
          <div className="flex flex-col gap-2 mb-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource title"
              required
              className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Resource link or file URL"
              required
              className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="file">File</option>
              <option value="link">Link</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
            disabled={submitting || !title.trim() || !url.trim()}
          >
            {submitting ? 'Sharing...' : 'Share Resource'}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
        {loading ? (
          <div className="text-blue-700">Loading resources...</div>
        ) : (
          resources.map((res) => (
            <div key={res.id} className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-blue-900">{res.title}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{res.type === 'file' ? 'File' : 'Link'}</span>
              </div>
              <div className="mb-2">
                {res.type === 'file' ? (
                  <a href={res.url} className="text-blue-700 underline hover:text-blue-900" download>Download</a>
                ) : (
                  <a href={res.url} className="text-blue-700 underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">Visit Link</a>
                )}
              </div>
              <div className="text-xs text-blue-600">Shared by {res.postedBy} on {res.date}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
} 