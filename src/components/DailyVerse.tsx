"use client";
import { useEffect, useState } from 'react';

const localVerses = [
  {
    reference: 'Philippians 4:13',
    text: 'I can do all things through Christ who strengthens me.'
  },
  {
    reference: 'Psalm 46:10',
    text: 'Be still, and know that I am God.'
  },
  {
    reference: 'Romans 8:28',
    text: 'And we know that in all things God works for the good of those who love him.'
  },
  {
    reference: 'Joshua 1:9',
    text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.'
  },
  {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.'
  },
];

export default function DailyVerse() {
  const [verse, setVerse] = useState<{ reference: string; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Try to fetch from a public API, fallback to local list
    const fetchVerse = async () => {
      setLoading(true);
      setError('');
      try {
        // Example API: https://beta.ourmanna.com/api/v1/get/?format=json
        const res = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setVerse({
          reference: data.verse.details.reference,
          text: data.verse.details.text,
        });
      } catch (e) {
        // Fallback: pick a verse based on the day of the year
        const day = new Date().getDay();
        setVerse(localVerses[day % localVerses.length]);
        setError('Could not fetch verse from API. Showing a local verse.');
      }
      setLoading(false);
    };
    fetchVerse();
  }, []);

  return (
    <section className="w-full bg-yellow-50 py-3 px-4 flex flex-col items-center justify-center border-b border-yellow-200">
      <h2 className="text-sm font-bold text-yellow-900 mb-2 uppercase">Daily Scripture</h2>
      <div className="max-w-6xl w-full">
        {loading ? (
          <div className="text-yellow-700 text-center">Loading verse...</div>
        ) : verse ? (
          <blockquote className="text-yellow-800 italic text-center">
            "{verse.text}" — <span className="font-bold">{verse.reference}</span>
          </blockquote>
        ) : (
          <div className="text-red-600 text-center">Could not load verse.</div>
        )}
      </div>
      {error && <div className="text-yellow-700 text-xs mt-1 text-center">{error}</div>}
    </section>
  );
} 