import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function Testimonials({ limit }: { limit?: number }) {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTestimonials() {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('date', { ascending: false });
      if (error) {
        setError('Failed to load testimonials.');
        setTestimonials([]);
      } else {
        setTestimonials(limit ? (data || []).slice(0, limit) : data || []);
      }
      setLoading(false);
    }
    fetchTestimonials();
  }, [limit]);

  if (loading) return <div className="text-blue-700">Loading testimonials...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!testimonials.length) return <div className="text-blue-700">No testimonials yet.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {testimonials.map((t) => (
        <div key={t.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
          <div className="text-blue-900 font-semibold mb-2">{t.name}</div>
          <div className="text-blue-700 mb-4">“{t.message}”</div>
          <div className="text-xs text-blue-400 mt-auto">{new Date(t.date).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
} 