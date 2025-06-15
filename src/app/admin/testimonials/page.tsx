"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AdminTestimonialsPage() {
  const [user, setUser] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAndTestimonials() {
      setLoading(true);
      setError('');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || userData.user.user_metadata?.role !== 'admin') {
        router.push('/');
        return;
      }
      setUser(userData.user);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', false)
        .order('date', { ascending: false });
      if (error) {
        setError('Failed to load testimonials.');
        setTestimonials([]);
      } else {
        setTestimonials(data || []);
      }
      setLoading(false);
    }
    fetchUserAndTestimonials();
  }, [router]);

  const handleApprove = async (id: string) => {
    setError('');
    const { error } = await supabase
      .from('testimonials')
      .update({ approved: true })
      .eq('id', id);
    if (error) {
      setError('Failed to approve testimonial.');
    } else {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    if (error) {
      setError('Failed to delete testimonial.');
    } else {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
  };

  if (loading) return <div className="text-blue-700 p-8">Loading testimonials...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">Moderate Testimonials</h1>
        {testimonials.length === 0 ? (
          <div className="text-blue-700 text-center">No testimonials pending approval.</div>
        ) : (
          <div className="space-y-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-blue-50 rounded-xl shadow p-6 flex flex-col">
                <div className="text-blue-900 font-semibold mb-2">{t.name}</div>
                <div className="text-blue-700 mb-4">"{t.message}"</div>
                <div className="text-xs text-blue-400 mb-4">{new Date(t.date).toLocaleDateString()}</div>
                <div className="flex gap-4">
                  <button
                    className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 transition"
                    onClick={() => handleApprove(t.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-700 text-white px-4 py-2 rounded font-semibold hover:bg-red-800 transition"
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 